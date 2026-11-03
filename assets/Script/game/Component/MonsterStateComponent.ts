import { IComponent } from "../Base/IComponent";
import { MonsterState } from "../Config/MonsterState";

/**
 * @description 怪物状态组件
 * 是怪物状态的【唯一事实来源】—— 只有 MonsterStateSystem 允许写它，
 * 其他系统只能读，避免出现多个系统抢写同一个状态字段（旧的 anim.nextState 就是这个毛病）。
 *
 * 里面全部是整数帧，不含任何秒/浮点时间，帧同步下可直接快照与回滚。
 */
export class MonsterStateComponent implements IComponent {
    /**当前逻辑状态*/
    state: MonsterState = MonsterState.Idle;

    /**进入当前状态的逻辑帧号；帧龄 = world.frame - enterFrame*/
    enterFrame: number = 0;

    /**相位偏移，由实体 id 派生，让不同怪物的呼吸/浮动节奏错开*/
    seed: number = 0;

    /**受击剩余帧数，>0 时状态被强制为 Hit*/
    hitFramesLeft: number = 0;

    /**朝向（-1 / 1），由 AI 写入，攻击冲刺与翻转都用它*/
    facing: number = 1;
}
