import { inputMgr } from "../../core/manager/InputManager";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { FrameInput, FrameInputBuffer, IFrameInputSource, INPUT_SCALE } from "./FrameInput";

/**
 * @description 本地输入源（单机 / 主机模式）
 *
 * 每个逻辑帧采样一次 inputMgr，量化成 FrameInput 后塞进缓冲区。
 * 这样"采样"和"消费"就分开了：
 *   - 采样发生在逻辑帧边界，与渲染帧无关
 *   - 消费只发生在 InputSystem 里，且有确定的帧归属
 *
 * 接网络之后，这个类会被 NetworkInputSource 替换：
 * 后者不再采样，而是等服务器下发的第 N 帧输入包。
 * World 和所有 System 都不需要改动 —— 这就是把它抽成接口的意义。
 */
export class LocalInputSource implements IFrameInputSource {
    private buffer: FrameInputBuffer;

    constructor(buffer: FrameInputBuffer) {
        this.buffer = buffer;
    }

    public produce(frame: number, playerCount: number): void {
        for (let p = 0; p < playerCount; p++) {
            const raw = inputMgr.getInput(p);

            // 量化：方向归一化向量 × 1000 后取整
            let dirX = 0;
            let dirY = 0;
            let speed = 0;
            if (raw) {
                dirX = Math.round(raw.direction.x * INPUT_SCALE);
                dirY = Math.round(raw.direction.y * INPUT_SCALE);
                // raw.speed 的量纲是 0~100（摇杆强度 × 100），先归一到 0~1 再定点
                const ratio = Math.max(0, Math.min(raw.speed / BATTLE_CONFIG.playerSpeed, 1));
                speed = Math.round(ratio * INPUT_SCALE);
            }

            // 开火：held 状态每帧为 true；单次点击只在采样到的那一帧为 true
            const fire = inputMgr.wantsToFire(p);

            const input: FrameInput = { frame, playerIndex: p, dirX, dirY, speed, fire };
            this.buffer.push(input);
        }
    }

    public ready(frame: number, playerCount: number): boolean {
        // 本地采样必然到齐
        return this.buffer.ready(frame, playerCount);
    }

    public prune(frame: number): void {
        this.buffer.pruneBefore(frame);
    }
}
