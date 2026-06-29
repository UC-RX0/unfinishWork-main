import { ISystem } from "../Base/ISystem";
import { PlayerInputComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";



export class WeaponSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [WeaponComponent, PlayerInputComponent, ViewComponent];
    init(): void {
        this.enable = true;
    }


    update(dt: number): void {
        let entitis = this.world.query(...this.requiredComponents);
        for (const entity of entitis) {
            let weaponComponent = this.world.getComp(entity, WeaponComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            let angle = Math.atan2(node.position.y, node.position.x);
            weaponComponent.bulletAngle = angle;


        }


    }

}