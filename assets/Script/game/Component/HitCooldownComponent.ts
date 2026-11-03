import { IComponent } from "../Base/IComponent";

/**
 * @description 攻击冷却组件
 *
 * 【为什么用【帧】而不是【秒】】
 *   浮点秒数累加在长时间运行后会有微小误差，帧同步下这会造成分叉。
 *   帧号是纯整数，永远不会漂。
 */
export class HitCooldownComponent implements IComponent {
    /**冷却帧数*/
    cooldownFrames: number = 60;
    /**已经过的帧数*/
    elapsedFrames: number = 0;
}
