import { ISystem } from "../Base/ISystem";
import { OwnerComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";



export class WeaponSyncSystem extends ISystem {
    //渲染优先级 209
    requiredComponents: ComponentClass<any>[] = [ViewComponent, OwnerComponent, WeaponComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entitis = this.world.query(...this.requiredComponents);
        for (const entity of entitis) {
            // console.log("WeaponSyncSystem", entity);
            let { ownerId } = this.world.getComp(entity, OwnerComponent);
            let { direction } = this.world.getComp(ownerId, VelocityComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            if (!node) continue;
            if (direction.length() <= 0) continue;
            // 只有Sin函数 在一二象限是正数 三四象限是负数 符合Cocos的角度方向
            let angle = Math.asin(Math.sin(direction.y / direction.length())) * 180 / Math.PI;
            console.log("angle", angle);
            node.angle = angle;
        }
    }


}