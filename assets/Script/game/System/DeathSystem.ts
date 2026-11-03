import { ISystem } from "../Base/ISystem";
import { AnimComponent, HealthComponent, ViewComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { MONSTER_VISUAL_CFG, MonsterState } from "../Config/MonsterState";
import { ComponentClass } from "../tool/ComponentManager";

//优先级130
export class DeathSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        this.updateMonsters();
        this.updateLegacyEntities();
    }

    /**
     * 怪物死亡：按状态机的帧龄判定，不再依赖动画是否播完。
     * 这样即使没有美术资源，死亡也会有一个明确的"持续 24 帧"的可视过程，
     * 而不是像旧实现那样因为 frames 为空而瞬间消失。
     */
    private updateMonsters(): void {
        const frame = this.world.frame;
        const entities = this.world.query(HealthComponent, MonsterStateComponent);
        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const st = this.world.getComp(id, MonsterStateComponent);
            if (st.state !== MonsterState.Dead) continue;
            if (frame - st.enterFrame < MONSTER_VISUAL_CFG.Dead.frames) continue;
            this.destroyEntity(id);
        }
    }

    /**其他实体（玩家等）沿用原来的动画播完即销毁逻辑*/
    private updateLegacyEntities(): void {
        let entities = this.world.query(HealthComponent, AnimComponent);
        for (let entity of entities) {
            if (this.world.hasComp(entity, MonsterStateComponent)) continue;

            let health = this.world.getComp(entity, HealthComponent);
            let anim = this.world.getComp(entity, AnimComponent);

            if (health.health <= 0) {
                let deadKey = anim.configs.has('dead') ? 'dead' : (anim.configs.has(IState.Explode) ? IState.Explode : null);
                if (deadKey && anim.state !== deadKey) {
                    anim.nextState = deadKey;
                }
                if (anim.isComplete) {
                    this.destroyEntity(entity);
                }
            }
        }
    }

    private destroyEntity(entityId: number): void {
        let view = this.world.getComp(entityId, ViewComponent);
        if (view && view.node) view.node.destroy();
        this.world.removeEntityById(entityId);
    }
}
