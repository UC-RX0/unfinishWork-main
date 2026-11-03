import { PathEnum, UIEnum } from "../../core/manager/UIManager";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, PosComponent, ViewComponent } from "../Component";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { DeferredNodeRecycler } from "../tool/DeferredNodeRecycler";
import { ComponentClass } from "../tool/ComponentManager";


//优先级105
export class BulletSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [BulletComponent, ViewComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let bulletComponent = this.world.getComp(entity, BulletComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            let anim = this.world.getComp(entity, AnimComponent);
            let pos = this.world.getComp(entity, PosComponent);

            // 1. 打中目标：动画播完（Explode）后回收
            if (anim && anim.isComplete) {
                this.retireBullet(entity, bulletComponent, node);
                continue;
            }

            // 2. 飞出战场：没打中任何东西的子弹永远不会自己结束
            //    （fly 状态是 interval=999 的无限循环），会一直飞下去。
            //    后果有二：实体泄漏（帧同步里实体ID序列会无限增长），
            //    以及跑到战场外破坏不变量。必须主动回收。
            if (pos) {
                const limitX = BATTLE_CONFIG.fieldHalfWidth + BATTLE_CONFIG.bulletOutMargin;
                const limitY = BATTLE_CONFIG.fieldHalfHeight + BATTLE_CONFIG.bulletOutMargin;
                if (Math.abs(pos.pos.x) > limitX || Math.abs(pos.pos.y) > limitY) {
                    this.retireBullet(entity, bulletComponent, node);
                    continue;
                }
            }
        }
    }

    /**
     * @description 退役一颗子弹
     *
     * 节点不能立即 recycle 回池 —— 回滚可能把这个世界还原到"这颗子弹还在飞"，
     * 那时节点已经被借给别的子弹了，就会张冠李戴。
     * 所以先隐藏 + 标记，等过了回滚窗口再真正回收（见 DeferredNodeRecycler）。
     */
    private retireBullet(entity: number, bulletComponent: any, node: any): void {
        if (node) {
            node.active = false;
            DeferredNodeRecycler.mark(node, this.world.frame, PathEnum.Bullet1, UIEnum.Bullet2);
        }
        this.world.removeEntity(bulletComponent.entity);
    }
}
