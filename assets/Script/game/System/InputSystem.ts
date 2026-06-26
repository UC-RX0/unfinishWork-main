
import { ISystem } from "../Base/ISystem";
import { PlayerInputComponent, VelocityComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";
import { Blackboard } from "../tool/Board";
import { inputMgr } from "../../core/manager/InputManager";

export class InputSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [PlayerInputComponent, VelocityComponent];

    init() {
        //初始化系统
        this.enable = true;
    }


    update(dt: number): void {
        //拿到所有玩家的ID
        const entityID = this.world.query(PlayerInputComponent, VelocityComponent);
        //根据输入状态更新速度
        for (const id of entityID) {
            const { playerIndex } = this.world.getComp(id, PlayerInputComponent);
            const input = inputMgr.getInput(playerIndex);
            if (!input) continue;
            const vel = this.world.getComp(id, VelocityComponent);
            vel.direction.set(input.direction);
            vel.speed = input.speed;
        }
    }

}