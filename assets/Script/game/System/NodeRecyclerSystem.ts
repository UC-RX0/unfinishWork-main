import { ISystem } from "../Base/ISystem";
import { DeferredNodeRecycler } from "../tool/DeferredNodeRecycler";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 节点回收系统（优先级 100，逻辑段）
 *
 * 把 DeferredNodeRecycler 的回收逻辑挂进系统调度 ——
 * 否则它只是个静态工具类，永远没人调用它。
 *
 * 为什么放在逻辑段的后段：
 *   回收判定依赖"这一帧刚标记的节点"，
 *   排在死亡之后（130）才能在同一帧看到新标记。
 *   而回收本身发生在窗口之后（几百帧），所以具体位置不敏感，
 *   只需要保证不与其它系统抢同一个节点。
 */
export class NodeRecyclerSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        DeferredNodeRecycler.update(this.world.frame);
    }
}
