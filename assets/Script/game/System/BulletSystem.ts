import { PathEnum, UIEnum } from "../../core/manager/UIManager";
import { resBridge } from "../../core/resource/ResBridge";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, ViewComponent } from "../Component";
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
            if (anim && anim.isComplete) {
                // 回收动作收敛到过渡层，BulletSystem 不再反向依赖 WeaponSystem 的静态池
                resBridge.recycle(PathEnum.Bullet1, UIEnum.Bullet2, node);
                this.world.removeEntity(bulletComponent.entity);
            }
        }
    }


}
