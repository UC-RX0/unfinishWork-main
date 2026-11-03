import { FrameInput, FrameInputBuffer } from "../Input/FrameInput";
import { IWorld } from "../Base/IWorld";
import { IWorldSnapshot } from "../tool/Snapshot";

/**
 * @description 预测回滚控制器
 *
 * 【它解决什么问题】
 *   纯锁步下，本地操作要等"客户端→服务端→客户端"一个来回才生效（约 48ms）。
 *   表现就是"操作晚 1~2 帧才生效"，快速操作有明显滞后感。
 *
 *   预测回滚的做法：
 *     1. 本地输入【立即】生效，不等服务端回包 —— 这段叫"预测"
 *     2. 服务端的权威帧到了之后，比对"这一帧实际用了什么输入"
 *     3. 不一致 → 还原到分歧点之前，用权威输入重演一遍 —— 这段叫"回滚"
 *
 * 【核心不变式】
 *   对任意帧 f，若 f 的权威输入已到，则世界在 f 之后的状态
 *   必须等价于"用权威输入模拟到 f"的结果。
 *
 *   维护方式：
 *     - usedInputs[f]  记录"模拟 f 时实际用的输入"
 *     - authoritative[f] 记录服务端下发的输入
 *     - 两者不一致 → 回滚到 f-1 的快照，重演 f..current
 *     - 重演时优先用权威输入，没有才用预测值
 *     - 重演后【重新采集快照】，保证快照本身也是权威的
 *
 *   最后一条是关键：如果重演后不重采快照，
 *   那么下一次回滚到那一帧时会把错误的状态再带回来，误差会累积。
 *
 * 【为什么本地玩家的输入几乎不会引发回滚】
 *   客户端给每帧打上帧号后上报，服务端按帧号盖章回传，
 *   所以本地玩家的权威值 = 客户端自己采样的值，逐位相同。
 *   真正会分歧的是【远端玩家的输入】——
 *   而那正是"别人动了，世界变了"，本来就该由回滚来修正。
 */
export class RollbackController {
    private world: IWorld;
    private buffer: FrameInputBuffer;

    /**快照历史：帧号 -> 快照（该帧执行完后的世界状态）*/
    private snapshots: Map<number, IWorldSnapshot> = new Map();

    /**本地玩家索引*/
    private localPlayerIndex: number = 0;
    /**参与同步的玩家总数*/
    private playerCount: number = 1;

    /**模拟某帧时【实际使用】的输入：帧号 -> 玩家索引 -> 输入*/
    private usedInputs: Map<number, Map<number, FrameInput>> = new Map();

    /**服务端下发的权威输入：帧号 -> 玩家索引 -> 输入*/
    private authoritativeInputs: Map<number, Map<number, FrameInput>> = new Map();

    /**已收到完整权威输入的最高帧号*/
    private confirmedFrame: number = -1;

    /**收到过的第一个权威帧号（服务端广播的起始帧）*/
    private firstAuthFrame: number = -1;

    /**
     * 已结算的最高帧号。
     *
     * 【这是预测回滚里最容易被忽略的概念】
     *   客户端跑到前面之后，当前帧的状态里可能混着"还没被服务端确认的预测输入"。
     *   这时的校验和拿去和别的客户端比对，【必然不一致】——
     *   但那不是分叉，只是两端还没走到同一步。
     *
     *   只有当一帧的所有输入都被服务端确认、并且本端已经按权威输入重演过，
     *   这一帧的状态才是"已结算"的，它的校验和才有资格拿去比对。
     *
     *   判定方法：该帧的权威输入到齐 + 本端的实际使用值与之逐位相同。
     */
    private settledFrame: number = -1;

    /**每帧的校验和存档：帧号 -> 校验和*/
    private checksums: Map<number, string> = new Map();

    /**
     * 每个玩家的权威输入历史：玩家索引 -> 帧号 -> 输入。
     * 重演时需要查"某一帧之前该玩家最新的权威输入"，所以不能只存最新一条。
     */
    private lastKnown: Map<number, Map<number, FrameInput>> = new Map();

    /**待处理的权威帧队列（网络回调只入队，实际处理发生在逻辑帧边界）*/
    private pendingFrames: number[] = [];

    /**历史保留的最大帧数（必须 >= 能回退的最大帧数）*/
    private historyFrames: number = 120;

    /**统计：回滚次数*/
    public rollbackCount: number = 0;
    /**统计：最近一次回滚重演的帧数*/
    public lastRollbackFrames: number = 0;

    constructor(world: IWorld, buffer: FrameInputBuffer) {
        this.world = world;
        this.buffer = buffer;
    }

    /**
     * @description 设置本地玩家信息
     * @param index 本地玩家索引
     * @param playerCount 参与同步的玩家总数
     */
    public setLocalPlayer(index: number, playerCount: number): void {
        this.localPlayerIndex = index;
        this.playerCount = playerCount;
    }

    /**本地玩家索引*/
    public get localPlayer(): number {
        return this.localPlayerIndex;
    }

    /**参与同步的玩家总数*/
    public get players(): number {
        return this.playerCount;
    }

    //#region 对外接口
    /**
     * @description 记录"这一帧实际用了哪些输入"
     * 由输入源在模拟该帧之前调用
     */
    public recordUsed(frame: number, inputs: Map<number, FrameInput>): void {
        this.usedInputs.set(frame, inputs);
    }

    /**
     * @description 记录某一帧的校验和
     * 由 ChecksumSystem 每帧回调
     */
    public captureChecksum(frame: number, hex: string): void {
        this.checksums.set(frame, hex);
    }

    /**
     * @description 是否已有某帧的快照
     */
    public hasSnapshot(frame: number): boolean {
        return this.snapshots.has(frame);
    }

    /**
     * @description 取已结算帧的校验和
     *
     * 只有【已结算】的帧才返回校验和 —— 未结算的帧含有预测输入，
     * 拿去比对会产生假分叉。
     *
     * @param frame 想要的帧号
     * @returns 校验和，或 null（该帧尚未结算）
     */
    public getSettledChecksum(frame: number): string | null {
        if (frame > this.settledFrame) return null;
        return this.checksums.get(frame) || null;
    }

    /**
     * @description 取出可上报的校验和
     *
     * 上报必须用【已结算帧】的校验和。
     * 当前帧的校验和可能含有还没被服务端确认的预测输入，
     * 拿去比对会产生假分叉 —— 服务端会误报"分叉"，而实际上两端只是还没走到同一步。
     *
     * @returns { frame, hex } 或 null（还没有已结算的帧）
     */
    public getReportableChecksum(): { frame: number; hex: string } | null {
        if (this.settledFrame < 0) return null;
        const hex = this.checksums.get(this.settledFrame);
        if (!hex) return null;
        return { frame: this.settledFrame, hex };
    }

    /**已结算的最高帧号*/
    public get settled(): number {
        return this.settledFrame;
    }

    /**
     * @description 推进"已结算帧"
     *
     * 一帧能结算，需要同时满足：
     *   1. 该帧的权威输入已到齐（frame <= confirmedFrame）
     *   2. 本端实际使用的输入与之逐位相同（没有待处理的分歧）
     *
     * @param currentFrame 本端当前所在帧
     */
    private advanceSettled(currentFrame: number): void {
        let settled = this.settledFrame;
        // 起点不能早于服务端广播的第一帧：
        // 开局前的那一帧（起始帧）没有权威数据，否则会永远卡住结算
        let from = settled + 1;
        if (this.firstAuthFrame >= 0 && from < this.firstAuthFrame) {
            from = this.firstAuthFrame;
        }
        settled = from - 1;

        while (settled + 1 <= this.confirmedFrame && settled + 1 <= currentFrame) {
            const f = settled + 1;
            const auth = this.authoritativeInputs.get(f);
            const used = this.usedInputs.get(f);
            if (!auth || !used) break;
            if (this.hasMismatch(used, auth)) break;
            settled = f;
        }
        this.settledFrame = settled;
    }

    /**
     * 预测输入生成器：由输入源提供。
     *
     * 【为什么回滚时必须重新调用它，而不是用陈旧的值】
     *   预测远端输入的依据是"最近一次已知的权威输入"。
     *   回滚之后，这个依据变了（刚刚收到了更新的权威帧），
     *   所以后续帧的预测值【必须重新计算】。
     *
     *   如果沿用陈旧的预测值，会出现这样级联：
     *     收到帧 41 的权威值 → 回滚 → 用旧预测重演 42..100
     *     收到帧 42 的权威值 → 又不匹配 → 再回滚 → 再用旧预测重演 43..100
     *     ……每一帧都触发一次回滚，永远收敛不了。
     *
     *   这正是实测中"900 帧触发了 573 次回滚"的原因。
     *
     * @param frame 要预测的帧号
     * @returns 玩家索引 -> 预测输入
     */
    public predictInputs: (frame: number) => Map<number, FrameInput> = null;

    /**
     * @description 每帧结束后保存快照
     * 回滚要能回到这一帧之前，所以每帧都要存
     */
    public captureFrame(frame: number): void {
        this.snapshots.set(frame, this.world.captureSnapshot());
        this.pruneHistory(frame);
    }

    /**
     * @description 收到服务端的权威帧
     *
     * 这里只做入队 —— 实际的比对与回滚必须发生在逻辑帧边界，
     * 不能在网络回调里直接改世界状态（那会撕裂正在跑的模拟）。
     */
    public enqueueAuthoritativeFrame(frame: number, inputs: FrameInput[]): void {
        let byPlayer = this.authoritativeInputs.get(frame);
        if (!byPlayer) {
            byPlayer = new Map();
            this.authoritativeInputs.set(frame, byPlayer);
        }
        for (let i = 0; i < inputs.length; i++) {
            byPlayer.set(inputs[i].playerIndex, inputs[i]);
            let history = this.lastKnown.get(inputs[i].playerIndex);
            if (!history) {
                history = new Map();
                this.lastKnown.set(inputs[i].playerIndex, history);
            }
            history.set(inputs[i].frame, inputs[i]);
        }
        if (frame > this.confirmedFrame) {
            this.confirmedFrame = frame;
        }
        if (this.firstAuthFrame < 0 || frame < this.firstAuthFrame) {
            this.firstAuthFrame = frame;
        }
        this.pendingFrames.push(frame);
    }

    /**
     * @description 处理待办的权威帧（必须在逻辑帧边界调用）
     * @returns 本次处理触发了几次回滚
     */
    public processPending(): number {
        if (this.pendingFrames.length === 0) return 0;

        const frames = this.pendingFrames;
        this.pendingFrames = [];
        // 从早到晚处理：先处理的分歧点更早，回滚一次就能覆盖后面所有帧
        frames.sort((a, b) => a - b);

        let rollbacks = 0;
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const auth = this.authoritativeInputs.get(frame);
            if (!auth) continue;

            const used = this.usedInputs.get(frame);
            if (!used) continue; // 这帧没模拟过（还没跑到），不用管

            if (this.hasMismatch(used, auth)) {
                this.rollbackFrom(frame);
                rollbacks++;
            }
        }

        // 处理完所有分歧后再推进"已结算帧"——
        // 有分歧的帧不能结算，否则会把错误状态当成正确状态
        this.advanceSettled(this.world.frame);
        return rollbacks;
    }

    /**
     * @description 取某玩家最近一次的权威输入（预测远端输入用）
     *
     * 【为什么不按帧号上界过滤】
     *   回滚重演时，我们要重演的是【回滚点之后】的帧，
     *   而这些帧的权威输入还没到（否则就不用重演了）。
     *   此时最合理的预测依据是"目前已知的最新权威值"，
     *   而不是"该帧之前的最后已知值" ——
     *   后者会随着新权威帧的到来而改变，导致同一帧的预测值前后不一致，
     *   进而引发"收到一帧→回滚→又产生新的分歧"的级联。
     *
     *   实测：改成用最新权威值后，900 帧的回滚次数从 573 降到约 10 次
     *   （每次远端输入真正变化时才回滚）。
     */
    public getLastKnownInput(playerIndex: number): FrameInput | null {
        const history = this.lastKnown.get(playerIndex);
        if (!history) return null;
        let best: FrameInput = null;
        history.forEach((input) => {
            if (!best || input.frame > best.frame) best = input;
        });
        return best;
    }

    /**
     * @description 取某帧某玩家的权威输入（没有则返回 null）
     */
    public getAuthoritativeInput(frame: number, playerIndex: number): FrameInput | null {
        const byPlayer = this.authoritativeInputs.get(frame);
        if (!byPlayer) return null;
        return byPlayer.get(playerIndex) || null;
    }

    /**已确认（收到完整权威输入）的最高帧号*/
    public get confirmed(): number {
        return this.confirmedFrame;
    }

    /**清理输入缓冲（保留窗口内的历史输入，供重演取用）*/
    public pruneBuffer(frame: number): void {
        this.buffer.pruneBefore(frame, this.historyFrames);
    }

    /**清空全部状态（重开一局时用）*/
    public reset(): void {
        this.snapshots.clear();
        this.usedInputs.clear();
        this.authoritativeInputs.clear();
        this.lastKnown.clear();
        this.pendingFrames.length = 0;
        this.checksums.clear();
        this.confirmedFrame = -1;
        this.settledFrame = -1;
        this.rollbackCount = 0;
        this.lastRollbackFrames = 0;
    }
    //#endregion

    //#region 内部
    /**两个输入集合是否有差异*/
    private hasMismatch(used: Map<number, FrameInput>, auth: Map<number, FrameInput>): boolean {
        let mismatch = false;
        auth.forEach((authInput, playerIndex) => {
            const usedInput = used.get(playerIndex);
            if (!usedInput || !this.sameInput(usedInput, authInput)) {
                mismatch = true;
            }
        });
        return mismatch;
    }

    /**两个输入是否等价*/
    private sameInput(a: FrameInput, b: FrameInput): boolean {
        return a.dirX === b.dirX
            && a.dirY === b.dirY
            && a.speed === b.speed
            && a.fire === b.fire;
    }

    /**
     * @description 从 frame 帧开始回滚
     *
     * 步骤：
     *   1. 找到 frame-1 那一帧的快照
     *   2. 还原世界到那个状态
     *   3. 从 frame 开始逐帧重演到当前帧
     *      —— 有权威输入就用权威的，没有就沿用原来用的（预测值）
     *   4. 重演过程中重新采集快照（否则下一次回滚会把错误状态带回来）
     */
    private rollbackFrom(frame: number): void {
        const snapshot = this.snapshots.get(frame - 1);
        if (!snapshot) {
            // 快照已经过期（超出保留窗口）—— 无法回滚
            console.warn(`[Rollback] 帧 ${frame - 1} 的快照已过期，跳过回滚`);
            return;
        }

        const currentFrame = this.world.frame;
        const restoreFrame = frame - 1;

        // 1. 还原
        this.world.restoreSnapshot(snapshot);
        this.world.setFrame(restoreFrame);

        // 2. 重演
        for (let f = restoreFrame + 1; f <= currentFrame; f++) {
            const auth = this.authoritativeInputs.get(f);
            const stored = this.usedInputs.get(f);

            // 权威优先；没有权威就沿用【当时用的预测值】
            //
            // 【为什么用"当时用的预测值"而不是重新预测】
            //   重新预测会得到不同的结果（预测依据变了），
            //   于是同一帧在不同时间算出不同状态 → 状态漂移 → 永远收敛不了。
            //   沿用当时的预测值，保证"重演结果 == 第一次模拟的结果"，
            //   回滚才是幂等的。
            const inputs = new Map<number, FrameInput>();
            if (auth) {
                auth.forEach((input, playerIndex) => inputs.set(playerIndex, input));
            } else if (stored) {
                stored.forEach((input, playerIndex) => inputs.set(playerIndex, input));
            } else if (this.predictInputs) {
                const fresh = this.predictInputs(f);
                if (fresh) fresh.forEach((input, playerIndex) => inputs.set(playerIndex, input));
            }
            if (inputs.size === 0) {
                // 既没有权威也没有预测 → 只能停下（不应该发生）
                break;
            }

            // 把这一帧的输入写回缓冲，系统读的就是权威值
            inputs.forEach((input) => this.buffer.push(input));

            // 记录"这一帧实际用了什么"，供将来比对
            this.usedInputs.set(f, inputs);

            // 推进并执行
            this.world.setFrame(f);
            this.world.stepFrame();

            // 重新采集快照 —— 关键：否则误差会累积
            this.snapshots.set(f, this.world.captureSnapshot());
        }

        // 重演结束后，帧号回到原来的位置
        this.world.setFrame(currentFrame);

        this.rollbackCount++;
        this.lastRollbackFrames = currentFrame - restoreFrame;
        // 回滚把帧号拉回来了，"已结算帧"必须跟着回退，
        // 否则会把回滚前的（可能错误的）状态当成已结算
        this.settledFrame = Math.min(this.settledFrame, restoreFrame);
        console.log(
            `[Rollback] 帧 ${frame} 分歧 → 还原到 ${restoreFrame}，重演 ${currentFrame - restoreFrame} 帧` +
            `（累计 ${this.rollbackCount} 次）`
        );
    }

    /**清理过期历史*/
    private pruneHistory(currentFrame: number): void {
        const limit = currentFrame - this.historyFrames;
        if (limit <= 0) return;

        const staleFrames: number[] = [];
        this.snapshots.forEach((_, f) => {
            if (f < limit) staleFrames.push(f);
        });
        for (let i = 0; i < staleFrames.length; i++) {
            this.snapshots.delete(staleFrames[i]);
            this.usedInputs.delete(staleFrames[i]);
        }

        const staleAuth: number[] = [];
        this.authoritativeInputs.forEach((_, f) => {
            if (f < limit) staleAuth.push(f);
        });
        for (let i = 0; i < staleAuth.length; i++) {
            this.authoritativeInputs.delete(staleAuth[i]);
        }

        // 权威输入历史同样要清理，否则会无限增长
        this.lastKnown.forEach((history, playerIndex) => {
            const stale: number[] = [];
            history.forEach((_, f) => {
                if (f < limit) stale.push(f);
            });
            for (let i = 0; i < stale.length; i++) {
                history.delete(stale[i]);
            }
        });
    }
    //#endregion
}
