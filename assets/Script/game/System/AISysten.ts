import { ISystem } from "../Base/ISystem";
import { AnimComponent, PlayerInputComponent, PosComponent, VelocityComponent } from "../Component";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { distanceSq, normalizeTo, Vec2Like } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 怪物追击（优先级 96）
 *
 * 逻辑层改造要点：
 *   1. 不再用 cc.Vec3.distance（每次开方），改用距离平方比较
 *   2. 不再 .clone().subtract().normalize() 三步走（三次临时对象），
 *      改为 normalizeTo 直接写入目标组件，零分配
 *   3. 速度常量来自 BATTLE_CONFIG，不散落在代码里
 */
export class AISystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [EnemyComponent, EnemyAIComponent, VelocityComponent, PosComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        // 收集所有玩家位置（直接引用组件里的向量对象，不拷贝）
        let playerIds = this.world.query(PlayerInputComponent, PosComponent);
        let playerPositions: { id: number; pos: Vec2Like }[] = [];
        for (let id of playerIds) {
            playerPositions.push({
                id,
                pos: this.world.getComp(id, PosComponent).pos,
            });
        }
        if (playerPositions.length === 0) return;

        let enemies = this.world.query(...this.requiredComponents);
        for (let entity of enemies) {
            let enemyComp = this.world.getComp(entity, EnemyComponent);
            let aiComp = this.world.getComp(entity, EnemyAIComponent);
            let velComp = this.world.getComp(entity, VelocityComponent);
            let posComp = this.world.getComp(entity, PosComponent);

            // 找最近玩家（用距离平方比较，避免每只怪物每个玩家开一次方）
            let closestId = -1;
            let closestPos: Vec2Like = null;
            let closestDistSq = Number.MAX_VALUE;
            for (let i = 0; i < playerPositions.length; i++) {
                const p = playerPositions[i];
                const d = distanceSq(posComp.pos.x, posComp.pos.y, p.pos.x, p.pos.y);
                if (d < closestDistSq) {
                    closestDistSq = d;
                    closestPos = p.pos;
                    closestId = p.id;
                }
            }
            if (closestId < 0) continue;

            // 把距离交给状态机判断是否进入攻击态
            aiComp.distanceSqToTarget = closestDistSq;

            // 朝向每帧都更新：即使进入攻击范围停下来，冲刺方向依然是有效的
            normalizeTo(velComp.direction, closestPos.x - posComp.pos.x, closestPos.y - posComp.pos.y);

            // 攻击范围内停下，否则以配置速度追击
            const range = enemyComp.attackRange || BATTLE_CONFIG.enemyAttackRange;
            velComp.speed = closestDistSq <= range * range ? 0 : BATTLE_CONFIG.enemyChaseSpeed;
        }
    }
}
