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
    enable: boolean;//是否启用
    /**系统依赖的组件 仅做限定查找条件 比如说角色需要有ViewComponent和OwnerComponent组件，但是PlayerIndexComponent组件作为角色唯一标识 可以带上 缩小查找范围，提高效率*/
    abstract requiredComponents: ComponentClass<any>[];
    /**执行操作， 每帧需要执行的逻辑*/
    abstract update(dt: number): void;
    abstract init(): void;
    //开启或关闭系统
    public enableOrDisable(enable: boolean): void {
        this.enable = enable;
    }
}