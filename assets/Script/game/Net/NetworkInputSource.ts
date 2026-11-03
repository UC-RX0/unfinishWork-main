import { inputMgr } from "../../core/manager/InputManager";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { FrameInput, FrameInputBuffer, IFrameInputSource, INPUT_SCALE } from "../Input/FrameInput";
import { NetClient } from "./NetClient";

/**
 * @description 网络输入源（联机 / 锁步模式）
 *
 * 与 LocalInputSource 的关键区别：
 *   - 本地采样后【不写缓冲】，而是上报给服务端
 *   - 缓冲里的输入全部来自服务端下发的 frame 包
 *   - ready() 会真的返回 false —— 这一帧的包没到齐就卡住不推进
 *
 * 为什么必须由服务端盖章：
 *   如果各客户端自己决定"这一帧用哪份输入"，稍有偏差就会永久分叉。
 *   把归属权交给服务端，所有人拿到的帧包字节一致，模拟才有可能一致。
 *
 * 代价：本地操作有一个往返延迟（约 1~2 帧，30ms 左右）。
 * 消除它需要客户端预测 + 回滚重演，属于下一阶段。
 */
export class NetworkInputSource implements IFrameInputSource {
    private buffer: FrameInputBuffer;
    private net: NetClient;
    /**本地玩家索引，由 welcome 下发*/
    public localPlayerIndex: number = 0;

    constructor(buffer: FrameInputBuffer, net: NetClient) {
        this.buffer = buffer;
        this.net = net;
    }

    public produce(frame: number, playerCount: number): void {
        // 只上报本端玩家的输入；其他玩家的输入由服务端打包下发
        const p = this.localPlayerIndex;
        const raw = inputMgr.getInput(p);

        let dirX = 0;
        let dirY = 0;
        let speed = 0;
        if (raw) {
            dirX = Math.round(raw.direction.x * INPUT_SCALE);
            dirY = Math.round(raw.direction.y * INPUT_SCALE);
            const ratio = Math.max(0, Math.min(raw.speed / BATTLE_CONFIG.playerSpeed, 1));
            speed = Math.round(ratio * INPUT_SCALE);
        }
        const fire = inputMgr.wantsToFire(p);

        // 同时上报给服务端（带上帧号，服务端按帧号盖章）
        this.net.sendInput(frame, dirX, dirY, speed, fire);
    }

    public ready(frame: number, playerCount: number): boolean {
        // 帧包没到齐就不推进 —— 这就是锁步"卡一下"的来源
        return this.buffer.ready(frame, playerCount);
    }

    public prune(frame: number): void {
        this.buffer.pruneBefore(frame);
    }

    /**重置：清空输入缓冲与全局输入状态*/
    public reset(): void {
        this.buffer.clear();
        inputMgr.reset();
    }

    /**把服务端下发的帧包灌进缓冲*/
    public applyFrame(msg: { frame: number; inputs: any[] }): void {
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
            this.buffer.push(input);
        }
    }
}
