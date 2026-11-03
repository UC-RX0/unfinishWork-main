import { ISystem } from "../Base/ISystem";
import { AnimComponent, HealthComponent, ViewComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { MONSTER_VISUAL_CFG, MonsterState } from "../Config/MonsterState";
import { DeferredNodeRecycler } from "../tool/DeferredNodeRecycler";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 死亡处理（优先级 130）
 *
 * 【为什么不能直接 destroy】
 *   回滚要求"实体在回滚后能复活"。
 *   如果死亡时就把节点 destroy() 了，回滚到实体还活着的时刻时，
 *   节点已经不存在了 —— 实体复活了但没有画面。
 *
 *   所以改成两段式：
 *     逻辑层：本帧立即移除实体（后续系统不再看到它）
 *     视图层：节点先隐藏，等过了回滚窗口（DeferredNodeRecycler）再真正回收
 *
 * 【时间基准】
 *   全部用逻辑帧号，不用秒。帧同步下这是唯一安全的做法。
 */
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

            this.killEntity(id);
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
                    this.killEntity(entity);
                }
            }
        }
    }

    /**
     * 击杀一个实体
     *
     * 顺序很重要：
     *   1. 先把节点藏起来（玩家立刻看不到尸体）
     *   2. 再从逻辑世界移除（后续系统不再处理它）
     *   3. 标记节点待回收（窗口过后才真正回收）
     *
     * 节点不立即 destroy —— 回滚要能把它复活。
     */
    private killEntity(entityId: number): void {
        const view = this.world.getComp(entityId, ViewComponent);
        if (view && view.node) {
            view.node.active = false;
            DeferredNodeRecycler.mark(view.node, this.world.frame, this.prefabKeyOf(view), this.prefabNameOf(view));
        }
        this.world.removeEntityById(entityId);
    }

    /**取节点对应的预制体标识（回收时用）*/
    private prefabKeyOf(view: any): string {
        return view.prefabKey || "";
    }

    private prefabNameOf(view: any): string {
        return view.prefabName || "";
    }
}
