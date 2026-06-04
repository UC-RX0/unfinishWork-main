import { PosComponent, VelocityComponent } from "../Component";
import { IComponent } from "../Base/IComponent";
import { ISystem } from "../Base/ISystem";



export class MoveSystem extends ISystem {
    requiredComponents: IComponent[] = [PosComponent, VelocityComponent];
    update(dt: number) {

    }
} 