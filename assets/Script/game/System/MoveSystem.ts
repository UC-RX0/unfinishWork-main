
import { ISystem } from "../Base/ISystem";
import { PosComponent, VelocityComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";
//  移动系统
//  优先值低于InputSystem
//  需要输入系统完成后再执行操作
export class MoveSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [PosComponent, VelocityComponent];
    //会在初始化的时候去查询所有需要的组件类
    //或者看World 是否会带有数据注入的方法
    //有待后续讨论实现
    init() {
        //初始化系统
        this.enable = true;
    }
    //开启或关闭系统
    update(dt: number) {
        //根据速度和方向更新位置
        let entityId = this.world.query(...this.requiredComponents);
        // console.log("MoveSystem update entityId", entityId);
        for (let id of entityId) {
            let posComponent = this.world.getComp(id, PosComponent);
            let velocityComponent = this.world.getComp(id, VelocityComponent);
            if (posComponent && velocityComponent) {
                posComponent.pos.y += velocityComponent.direction.y * velocityComponent.speed * dt;
                posComponent.pos.x += velocityComponent.direction.x * velocityComponent.speed * dt;
            }
        }
    }
} 