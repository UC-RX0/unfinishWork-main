import { Node } from "cc";
import { IComponent } from "../Base/IComponent";
export class ViewComponent implements IComponent {
    node:Node = null;
    /**
     * 表现层子节点（可选）。
     *
     * 存在的意义：clip 动画用的是【绝对 position 轨道】，
     * 直接播在根节点上会把实体瞬移到原点（clip 记录的坐标是它被编辑时的局部坐标）。
     *
     * 解决办法是让 clip 播在一个位于原点的子节点上，
     * 这样 clip 的位移就变成了相对根节点的偏移量。
     *
     * 没有这个节点的实体不播 clip，走程序化表现即可。
     */
    fxNode: Node = null;
}
