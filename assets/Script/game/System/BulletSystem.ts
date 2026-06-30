import { ISystem } from "../Base/ISystem";
import { BulletComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";


//优先级105
export class BulletSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [BulletComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let bulletComponent = this.world.getComp(entity, BulletComponent);
            bulletComponent.lifeTime -= dt;
            if (bulletComponent.lifeTime <= 0) {
                this.world.removeEntity(bulletComponent.entity);
            }
        }
    }


}