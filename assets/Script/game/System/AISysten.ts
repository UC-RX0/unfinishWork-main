import { Vec3 } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, PlayerInputComponent, PosComponent, VelocityComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { ComponentClass } from "../tool/ComponentManager";

export class AISystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [EnemyComponent, EnemyAIComponent, VelocityComponent, PosComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        // 收集所有玩家位置
        let playerIds = this.world.query(PlayerInputComponent, PosComponent);
        let playerPositions: { id: number; pos: Vec3 }[] = [];
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
            let velComp = this.world.getComp(entity, VelocityComponent);
            let posComp = this.world.getComp(entity, PosComponent);
            let anim = this.world.getComp(entity, AnimComponent);

            // 找最近玩家
            let closest: { id: number; pos: Vec3; dist: number } = null;
            for (let p of playerPositions) {
                let d = Vec3.distance(posComp.pos, p.pos);
                if (!closest || d < closest.dist) {
                    closest = { ...p, dist: d };
                }
            }

            // 在攻击范围内 → 停下
            if (closest.dist <= enemyComp.attackRange) {
                velComp.speed = 0;
            }
            // 在攻击范围外 → 追击
            else {
                velComp.speed = 80;
                let dir = closest.pos.clone().subtract(posComp.pos).normalize();
                velComp.direction.set(dir.x, dir.y);
            }
        }
    }
}