import { _decorator } from 'cc';
import { ISystem } from '../Base/ISystem';
import { ComponentClass } from '../tool/ComponentManager';
import { PlayerInputComponent, VelocityComponent, ViewComponent } from '../Component';

/**
 * @description 面向方向系统
 * 属于渲染系统
*/
export class FaceDirectionSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [ViewComponent, VelocityComponent, PlayerInputComponent];
    init(): void {
        this.enable = true;

    }
    update(dt: number) {
        //获得同时带有requiredComponents中所有组件的实体
        const entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let { node } = this.world.getComp(entity, ViewComponent)
            let { direction } = this.world.getComp(entity, VelocityComponent)

            //证明输入的方向是向左 与原图方向相反
            if (direction.x < 0) {
                node.setScale(-1, 1, 1)
            } else if (direction.x > 0) {
                node.setScale(1, 1, 1)
            }
        }
    }
}
