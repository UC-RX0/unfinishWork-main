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
            // 旋转根节点（Body 的 parent），不改 Body 本身的 angle
            let weaponRoot = node.parent || node;
            if (direction.lengthSqr() > 0.001) {
                weaponComponent.aimDirection.set(direction);
                let worldAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
                if (direction.x < 0) {
                    weaponRoot.angle = 180 - worldAngle;
                } else {
                    weaponRoot.angle = worldAngle;
                }
            }
            // 静止时保持上一帧角度和方向不变
        }
    }
}