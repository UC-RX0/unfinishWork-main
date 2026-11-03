import { inputMgr } from "../../core/manager/InputManager";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { FrameInput, FrameInputBuffer, IFrameInputSource, INPUT_SCALE } from "../Input/FrameInput";
import { NetClient } from "./NetClient";
import { RollbackController } from "./RollbackController";

/**
 * @description 预测式网络输入源（联机 + 客户端预测 + 回滚）
 *
 * ## 设计要点
 *
 * ### 1. 本地输入零延迟
 *   本地玩家的输入在采样的那一帧【立即生效】，不等服务端确认。
 *   这就是"客户端预测"带来的手感提升 —— 操作不再有网络往返的延迟。
 *
 * ### 2. 远端输入不猜
 *   远端玩家的输入【必须等服务端的权威帧】。
 *
 *   为什么不猜（这是本实现最重要的决定）：
 *   猜远端输入会产生两个问题：
 *     1. 猜错就回滚，而远端输入几乎每帧都在变 → 回滚极其频繁
 *        （实测 900 帧触发 573 次回滚，每次还要重演十几帧，CPU 浪费巨大）
 *     2. 更糟的是"重演时重新预测"会让同一帧在不同时间算出不同状态，
 *        状态漂移，永远收敛不了
 *
 *   所以远端输入宁可等 —— 反正远端玩家的操作延迟不影响本地手感。
 *
 * ### 3. 本地输入不会引起回滚
 *   客户端上报输入时带上帧号，服务端按帧号盖章回传。
 *   所以本地玩家的权威值 = 客户端自己采样的值，逐位相同 ——
 *   本地输入永远不会触发回滚。
 *
 * ### 4. 回滚仍然保留
 *   万一出现分歧（比如重连、时钟漂移），回滚机制能修正状态。
 *   它是安全网，不是主要路径。
 *
 * ## 帧推进规则
 *   一帧可以执行，当且仅当：
 *     - 远端玩家的权威输入已到齐
 *     - 本地玩家的输入由我们自己采样（永远"到齐"）
 *
 *   这意味着客户端最多领先服务端【远端确认到的帧】一点点，
 *   但本地的操作却是即时的 —— 因为本地输入不需要等。
 */
export class PredictiveInputSource implements IFrameInputSource {
    private buffer: FrameInputBuffer;
    private net: NetClient;
    private rollback: RollbackController;

    /**本地玩家索引，由 welcome 下发*/
    public localPlayerIndex: number = 0;

    /**参与同步的玩家总数*/
    private playerCount: number = 1;

    /**
     * 已采样的本地输入：帧号 -> 输入。
     *
     * 【为什么必须缓存】
     *   一帧的输入必须【只采样一次】。
     *   如果每次重试都重新采样：
     *     - 上报给服务端的值可能是第 N 次采样
     *     - 而实际执行这一帧用的是第 M 次采样
     *   两边不一致 → 服务端盖的章与客户端执行用的输入不同 → 分叉。
     */
    private sampled: Map<number, FrameInput> = new Map();

    constructor(buffer: FrameInputBuffer, net: NetClient, rollback: RollbackController) {
        this.buffer = buffer;
        this.net = net;
        this.rollback = rollback;

        // 回滚重演时由回滚控制器调用，用【当前最新的权威知识】重新预测。
        rollback.predictInputs = (frame: number) => this.predictInputs(frame);
    }

    /**
     * @description 开局：上报第一帧的输入
     *
     * 【为什么需要这一步】
     *   服务端要广播第 N 帧，必须先收到所有客户端对第 N 帧的输入。
     *   而客户端要推进到第 N 帧，得先收到第 N 帧的确认。
     *   —— 直接死锁。
     *
     *   打破办法：客户端在连上后【立刻】上报起始帧的输入，
     *   服务端拿到后就能广播第一帧，客户端收到确认后开始推进。
     */
    public bootstrap(firstFrame: number, playerCount: number): void {
        this.playerCount = playerCount;
        this.produce(firstFrame, playerCount);
    }

    public produce(frame: number, playerCount: number): void {
        const p = this.localPlayerIndex;
        this.playerCount = playerCount;

        // 1. 本地输入：每帧只采样一次，之后一直复用
        let local = this.sampled.get(frame);
        if (!local) {
            local = this.sampleLocal(frame, p);
            this.sampled.set(frame, local);
        }

        // 2. 组装本帧的输入：
        //    - 本地玩家：用采样值（立即生效，这就是预测）
        //    - 远端玩家：用权威值（还没到就先用预测值占位，等权威帧到了由回滚修正）
        const used = new Map<number, FrameInput>();
        used.set(p, local);

        for (let i = 0; i < playerCount; i++) {
            if (i === p) continue;
            const auth = this.rollback.getAuthoritativeInput(frame, i);
            if (auth) {
                used.set(i, { ...auth, frame });
            } else {
                const last = this.rollback.getLastKnownInput(i);
                used.set(i, last
                    ? { frame, playerIndex: i, dirX: last.dirX, dirY: last.dirY, speed: last.speed, fire: last.fire }
                    : { frame, playerIndex: i, dirX: 0, dirY: 0, speed: 0, fire: false });
            }
        }

        // 3. 写入缓冲，让系统这一帧就能用上
        used.forEach((input) => this.buffer.push(input));

        // 4. 记录"这一帧实际用了什么"，供权威帧到了之后比对
        this.rollback.recordUsed(frame, used);

        // 5. 上报本地输入（服务端按帧号盖章）
        this.net.sendInput(frame, local.dirX, local.dirY, local.speed, local.fire);

        // 6. 清理过老的采样（窗口之外不会再用到）
        if ((frame & 63) === 0) {
            const limit = frame - 240;
            this.sampled.forEach((_, f) => {
                if (f < limit) this.sampled.delete(f);
            });
        }
    }

    public ready(frame: number, playerCount: number): boolean {
        // 【本地操作零延迟的实现点】
        //
        // 远端玩家的输入必须到齐，否则那一帧没法模拟。
        // 但本地玩家的输入是我们自己采样的，永远"到齐"，
        // 所以本地操作在采样的那一帧就生效 —— 没有任何网络等待。
        //
        // 远端输入没到时，用预测值占位继续跑，
        // 等权威帧到了由回滚机制修正状态。
        //
        // 为什么不能无限领先：
        //   服务端要广播第 N 帧必须等所有客户端都上报了 N。
        //   客户端跑太远 → 服务端等不齐 → 死锁。
        //   所以限制"领先已确认帧的最大距离"。
        const confirmed = this.rollback.confirmed;
        if (confirmed < 0) {
            // 一帧权威帧都还没收到：等第一帧（bootstrap 已经上报了起始帧输入）
            return false;
        }
        return frame <= confirmed + this.maxLeadFrames;
    }

    /**
     * 最多领先"已确认帧"多少帧。
     *
     * 这个值决定了两件事：
     *   1. 客户端能跑多远（太远服务端等不齐输入 → 死锁）
     *   2. 每次回滚要重演多少帧（太远则 CPU 浪费大）
     *
     * 8 帧（约 130ms）足以覆盖一个来回的延迟，又不至于让重演太长。
     */
    public maxLeadFrames: number = 8;

    public prune(frame: number): void {
        // 输入缓冲的清理交给回滚控制器（它要保留窗口内的历史输入用于重演）
        this.rollback.pruneBuffer(frame);
    }

    /**把服务端下发的帧包灌进缓冲，并交给回滚控制器比对*/
    public applyFrame(msg: { frame: number; inputs: any[] }): void {
        const inputs: FrameInput[] = [];
        for (let i = 0; i < msg.inputs.length; i++) {
            const it = msg.inputs[i];
            const input: FrameInput = {
                frame: msg.frame,
                playerIndex: it.playerIndex,
                dirX: it.dirX,
                dirY: it.dirY,
                speed: it.speed,
                fire: it.fire,
            };
            inputs.push(input);
        }

        // 权威帧先入队，比对与回滚在逻辑帧边界统一处理
        this.rollback.enqueueAuthoritativeFrame(msg.frame, inputs);
    }

    /**
     * @description 生成第 frame 帧的预测输入
     * 只在回滚重演时使用（那时还没有权威输入）
     */
    public predictInputs(frame: number): Map<number, FrameInput> {
        const p = this.localPlayerIndex;
        const used = new Map<number, FrameInput>();

        const local = this.sampled.get(frame);
        used.set(p, local || this.sampleLocal(frame, p));

        for (let i = 0; i < this.playerCount; i++) {
            if (i === p) continue;
            const last = this.rollback.getLastKnownInput(i);
            used.set(i, last
                ? { frame, playerIndex: i, dirX: last.dirX, dirY: last.dirY, speed: last.speed, fire: last.fire }
                : { frame, playerIndex: i, dirX: 0, dirY: 0, speed: 0, fire: false });
        }
        return used;
    }

    /**采样本地输入*/
    private sampleLocal(frame: number, playerIndex: number): FrameInput {
        const raw = inputMgr.getInput(playerIndex);

        let dirX = 0;
        let dirY = 0;
        let speed = 0;
        if (raw) {
            dirX = Math.round(raw.direction.x * INPUT_SCALE);
            dirY = Math.round(raw.direction.y * INPUT_SCALE);
            const ratio = Math.max(0, Math.min(raw.speed / BATTLE_CONFIG.playerSpeed, 1));
            speed = Math.round(ratio * INPUT_SCALE);
        }
        const fire = inputMgr.wantsToFire(playerIndex);

        return { frame, playerIndex, dirX, dirY, speed, fire };
    }
}
