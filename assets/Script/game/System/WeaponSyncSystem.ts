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
            let { ownerId } = this.world.getComp(entity, OwnerComponent);
            let { direction } = this.world.getComp(ownerId, VelocityComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            let weaponComponent = this.world.getComp(entity, WeaponComponent);
            if (!node) continue;
            if (direction.length() <= 0) continue;
            let angle = Math.asin(Math.sin(direction.y / direction.length())) * 180 / Math.PI;
            // 转换为角度
            node.angle = angle;
            weaponComponent.angle = angle;
        }
    }
}