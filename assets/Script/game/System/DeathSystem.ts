import { ISystem } from "../Base/ISystem";
import { AnimComponent, HealthComponent, ViewComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { ComponentClass } from "../tool/ComponentManager";

//优先级130
export class DeathSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        let entities = this.world.query(HealthComponent, AnimComponent);
        for (let entity of entities) {
            let health = this.world.getComp(entity, HealthComponent);
            let anim = this.world.getComp(entity, AnimComponent);

            if (health.health <= 0) {
                let deadKey = anim.configs.has('dead') ? 'dead' : (anim.configs.has(IState.Explode) ? IState.Explode : null);
                if (deadKey && anim.state !== deadKey) {
                    anim.nextState = deadKey;
                }
                if (anim.isComplete) {
                    let view = this.world.getComp(entity, ViewComponent);
                    if (view && view.node) view.node.destroy();
                    this.world.removeEntityById(entity);
                }
            }
        }
    }
}