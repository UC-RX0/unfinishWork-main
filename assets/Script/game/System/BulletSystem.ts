import { PathEnum, UIEnum } from "../../core/manager/UIManager";
import { resBridge } from "../../core/resource/ResBridge";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, PosComponent, ViewComponent } from "../Component";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
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
                // 回收动作收敛到过渡层，BulletSystem 不再反向依赖 WeaponSystem 的静态池
                resBridge.recycle(PathEnum.Bullet1, UIEnum.Bullet2, node);
                this.world.removeEntity(bulletComponent.entity);
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
                    resBridge.recycle(PathEnum.Bullet1, UIEnum.Bullet2, node);
                    this.world.removeEntity(bulletComponent.entity);
                    continue;
                }
            }
        }
    }


}
