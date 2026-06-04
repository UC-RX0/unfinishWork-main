import { IComponent } from "./IComponent";



/**
 * - 0-99：输入相关（InputSystem）
 * - 100-199：游戏逻辑（MoveSystem、CollisionSystem、AttackSystem）
 * - 200-299：渲染同步（RenderSystem）
 * - 300+：清理（CleanupSystem）
*/
export abstract class ISystem {
    world: IWorld;//注册时由World注入
    priority: number;
    enable: boolean;
    abstract requiredComponents: IComponent[];
    /**执行操作， 每帧需要执行的逻辑*/
    abstract update(dt: number): void;
}