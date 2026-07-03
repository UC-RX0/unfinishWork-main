import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, ViewComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { ComponentClass } from "../tool/ComponentManager";
import { WeaponSystem } from "./WeaponSystem";


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
                WeaponSystem.bulletPool.put(node);
                this.world.removeEntity(bulletComponent.entity);
            }
        }
    }


}