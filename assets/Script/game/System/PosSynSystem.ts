import { ISystem } from "../Base/ISystem";
import { PosComponent, ViewComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * 渲染位置PosComponent
 * 优先值200
*/
export class PosSynSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [ViewComponent,PosComponent];
    init() {
        this.enable = true;
    }


    update(dt: number): void {
        const entityID = this.world.query(ViewComponent,PosComponent);
        for (const id of entityID) {
            const pos = this.world.getComp(id,PosComponent);
            const view = this.world.getComp(id,ViewComponent);
            view.node.position = pos.pos;
        }
    }


}