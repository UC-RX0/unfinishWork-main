import { ISystem } from "../Base/ISystem";
import { BulletComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";

//优先级103
export class BulletDirSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [BulletComponent, ViewComponent, VelocityComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let vel = this.world.getComp(entity, VelocityComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            let dir = vel.direction;
            if (dir.length() > 0) {
                node.angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
            }
        }
    }


}