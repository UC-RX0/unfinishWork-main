import { ISystem } from "../Base/ISystem";
import { BattleStateComponent } from "../Component/BattleStateComponent";
import { PlayerInputComponent, VelocityComponent } from "../Component";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { INPUT_SCALE } from "../Input/FrameInput";
import { setVec2 } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 输入写入（优先级 0）
 *
 * 改造前：直接读 inputMgr 的最新状态。
 * 问题在于"最新状态"属于渲染帧，不是逻辑帧 —— 一次渲染帧补跑两个逻辑帧时，
 * 两个逻辑帧会读到同一份输入，这次点击到底算在哪一帧是不确定的；
 * 反过来卡顿时又会漏掉中间帧的输入。帧同步下必须杜绝。
 *
 * 改造后：只从 world.getInput(当前帧号, 玩家) 读。
 * 输入在进入逻辑帧之前就已经被量化并按帧号归位，
 * 所以"第 N 帧用了什么输入"是完全确定的，可重放、可回滚。
 */
export class InputSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [PlayerInputComponent, VelocityComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        const entityIds = this.world.query(...this.requiredComponents);

        // 结算后锁定操作：世界照常推进（联机时不能停，否则锁步会卡死），
        // 但玩家不再能操作。
        if (this.isSettled()) {
            for (let i = 0; i < entityIds.length; i++) {
                const vel = this.world.getComp(entityIds[i], VelocityComponent);
                if (vel) {
                    setVec2(vel.direction, 0, 0);
                    vel.speed = 0;
                }
            }
            return;
        }

        for (let i = 0; i < entityIds.length; i++) {
            const id = entityIds[i];
            const playerInput = this.world.getComp(id, PlayerInputComponent);
            const input = this.world.getInput(frame, playerInput.playerIndex);
            if (!input) continue;

            const vel = this.world.getComp(id, VelocityComponent);

            // 定点整数还原成浮点：这一步是确定的（整数除法 + 乘法，IEEE 正确舍入）
            setVec2(vel.direction, input.dirX / INPUT_SCALE, input.dirY / INPUT_SCALE);
            vel.speed = input.speed / INPUT_SCALE * BATTLE_CONFIG.playerSpeed;
        }
    }

    /**对局是否已结算*/
    private isSettled(): boolean {
        const ids = this.world.query(BattleStateComponent);
        if (ids.length === 0) return false;
        const state = this.world.getComp(ids[0], BattleStateComponent);
        return !!state && state.settled;
    }
}
