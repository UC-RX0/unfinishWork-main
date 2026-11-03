import { ISystem } from "../Base/ISystem";
import { EnemyComponent, OwnerComponent, PosComponent, VelocityComponent, WeaponComponent } from "../Component";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { copyVec2, lengthSq, normalizeTo } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 武器朝向（优先级 10，逻辑段）
 *
 * 从原 WeaponSyncSystem 里拆出来的逻辑那一半：
 *   只算 WeaponComponent.aimDirection，不碰任何节点。
 *
 * 放在优先级 10 是为了让 WeaponSystem（90）在同一帧就能拿到本帧的朝向，
 * 而原来它在 209，武器要等下一帧才能用上最新方向，子弹方向会滞后一帧。
 *
 * ## 朝向规则
 *   有敌人 → 指向【最近的敌人】（自动瞄准）
 *   没敌人 → 沿用移动方向（跑动时的朝向）
 *
 * 【为什么必须有自动瞄准】
 *   原来的实现是"朝向 = 移动方向"。这在"站着不动打怪"时没问题，
 *   但玩家一旦边跑边打（躲避是必然的），子弹就朝逃跑方向飞 ——
 *   永远打不到正在追自己的怪。
 *
 *   实测：躲避走位 + 朝向=移动方向 → 20000 帧只杀掉 1 只怪，
 *   游戏根本没法玩。
 *
 *   改成自动瞄准后，子弹始终指向最近的威胁，
 *   玩家的走位和射击就解耦了 —— 这也正是真实动作游戏的做法。
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

            const ownerPos = this.world.getComp(owner.ownerId, PosComponent);
            if (!ownerPos) continue;

            // 找【射程内】最近的敌人
            //
            // 【为什么要限制射程】
            //   无限制时玩家能秒杀远处的怪，怪走不到跟前 ——
            //   Attack 状态不会触发，也没有"被围攻"的压力。
            //   射程外的怪必须靠近才能被打到，交战节奏才成立。
            const enemies = this.world.query(EnemyComponent, PosComponent);
            let nearest: PosComponent = null;
            let nearestDist = Number.MAX_VALUE;
            const maxDistSq = BATTLE_CONFIG.aimRange * BATTLE_CONFIG.aimRange;
            for (let e = 0; e < enemies.length; e++) {
                const ep = this.world.getComp(enemies[e], PosComponent);
                const dx = ep.pos.x - ownerPos.pos.x;
                const dy = ep.pos.y - ownerPos.pos.y;
                const d = dx * dx + dy * dy;
                if (d > maxDistSq) continue;
                if (d < nearestDist) {
                    nearestDist = d;
                    nearest = ep;
                }
            }

            if (nearest) {
                // 指向射程内最近的敌人
                normalizeTo(
                    weapon.aimDirection,
                    nearest.pos.x - ownerPos.pos.x,
                    nearest.pos.y - ownerPos.pos.y
                );
                continue;
            }

            // 射程内没有敌人 → 沿用移动方向
            const ownerVel = this.world.getComp(owner.ownerId, VelocityComponent);
            if (!ownerVel) continue;
            // 静止时保留上一帧朝向：direction 不会被清空，所以这里只做"有方向才更新"
            if (lengthSq(ownerVel.direction.x, ownerVel.direction.y) > 0.001) {
                copyVec2(weapon.aimDirection, ownerVel.direction);
            }
        }
    }
}
