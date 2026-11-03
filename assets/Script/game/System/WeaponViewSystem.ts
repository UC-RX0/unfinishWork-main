import { ISystem } from "../Base/ISystem";
import { OwnerComponent, ViewComponent, WeaponComponent } from "../Component";
import { lengthSq } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 武器外观朝向（优先级 209，渲染段）
 *
 * 原 WeaponSyncSystem 里负责视觉的那一半。
 * 唯一用到 Math.atan2 的地方，但它只写 node.angle，不回流到任何逻辑字段，
 * 所以不会污染确定性。
 */
export class WeaponViewSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [ViewComponent, OwnerComponent, WeaponComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const entities = this.world.query(...this.requiredComponents);
        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const view = this.world.getComp(id, ViewComponent);
            const weapon = this.world.getComp(id, WeaponComponent);
            const node = view.node;
            if (!node) continue;

            const aim = weapon.aimDirection;
            if (lengthSq(aim.x, aim.y) <= 0.001) continue;

            // 旋转根节点（Body 的 parent），不改 Body 本身的 angle
            const weaponRoot = node.parent || node;
            const worldAngle = Math.atan2(aim.y, aim.x) * 180 / Math.PI;
            weaponRoot.angle = aim.x < 0 ? 180 - worldAngle : worldAngle;
        }
    }
}
