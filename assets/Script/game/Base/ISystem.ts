import { ComponentClass } from "../tool/ComponentManager";
import { IWorld } from "./IWorld";
/**
 * - 0-99：输入相关（InputSystem）
 * - 100-199：游戏逻辑（MoveSystem、CollisionSystem、AttackSystem）
 * - 200-299：渲染同步（RenderSystem）
 * - 300+：清理（CleanupSystem）
*/
export abstract class ISystem {
    world: IWorld;//注册时由World注入
    priority: number;//系统优先级，优先级低的先执行，高的是后执行
    enable: boolean = true;//是否启用
    /**系统依赖的组件 仅做限定查找条件 比如说角色需要有ViewComponent和OwnerComponent组件，但是PlayerIndexComponent组件作为角色唯一标识 可以带上 缩小查找范围，提高效率*/
    abstract requiredComponents: ComponentClass<any>[];
    /**执行操作， 每帧需要执行的逻辑*/
    //证明这个Update的设计还是不够理想 要等到所有物体准备就绪后再执行
    abstract update(dt: number): void;
    init(): void {
        //初始化系统
        this.enable = true;
    };
    //开启或关闭系统
    public enableOrDisable(enable: boolean): void {
        this.enable = enable;
    }

    /**
     * @description 导出系统自身的逻辑状态
     * 系统里凡是【不属于任何组件】的逻辑状态（比如刷怪计时器）都必须在这里导出，
     * 否则回滚之后这部分状态会停留在回滚后的时间点，导致重演结果与原来不一致。
     * 默认返回 null，表示本系统没有需要保存的状态。
     */
    captureState(): any {
        return null;
    }

    /**
     * @description 还原系统自身的逻辑状态
     * 与 captureState 成对使用。
     */
    restoreState(data: any): void {
        // 默认无状态需要还原
    }
}