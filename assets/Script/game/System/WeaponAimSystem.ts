import { ISystem } from "../Base/ISystem";
import { OwnerComponent, VelocityComponent, WeaponComponent } from "../Component";
import { copyVec2, lengthSq } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 武器朝向（优先级 10，逻辑段）
 *
 * 从原 WeaponSyncSystem 里拆出来的逻辑那一半：
 *   只把主人的速度方向拷进 WeaponComponent.aimDirection，不碰任何节点。
 *
 * 放在优先级 10 是为了让 WeaponSystem（90）在同一帧就能拿到本帧的朝向，
 * 而原来它在 209，武器要等下一帧才能用上最新方向，子弹方向会滞后一帧。
 */
export class WeaponAimSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [WeaponComponent, OwnerComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const entities = this.world.query(...this.requiredComponents);
        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const weapon = this.world.getComp(id, WeaponComponent);
            const owner = this.world.getComp(id, OwnerComponent);
            if (!owner) continue;

            const ownerVel = this.world.getComp(owner.ownerId, VelocityComponent);
            if (!ownerVel) continue;

            // 静止时保留上一帧朝向：direction 不会被清空，所以这里只做"有方向才更新"
            if (lengthSq(ownerVel.direction.x, ownerVel.direction.y) > 0.001) {
                copyVec2(weapon.aimDirection, ownerVel.direction);
            }
        }
    }
}
