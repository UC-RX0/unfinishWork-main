import { ISystem } from "../Base/ISystem";
import { PosComponent, ViewComponent } from "../Component";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * 渲染位置PosComponent
 * 优先值200
*/
export class PosSyncSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [ViewComponent, PosComponent];
    init() {
        this.enable = true;
    }
    update(dt: number): void {
        const entityID = this.world.query(ViewComponent, PosComponent);
        // console.log("PosSyncSystem update entityID", entityID);
        for (const id of entityID) {
            // 怪物的位置由 MonsterVisualSystem 写（逻辑位置 + 表现偏移），
            // 这里必须跳过，否则两个系统抢写 node.position 会导致攻击冲刺闪烁
            if (this.world.hasComp(id, MonsterStateComponent)) continue;
            const pos = this.world.getComp(id, PosComponent);
            const view = this.world.getComp(id, ViewComponent);
            if (!view.node) continue;
            // 逻辑层的纯数据向量在这里跨越到引擎类型，是唯一允许的转换点
            view.node.setPosition(pos.pos.x, pos.pos.y, 0);
        }
    }


}