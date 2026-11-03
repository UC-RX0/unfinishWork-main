import { IComponent } from "../Base/IComponent";



export class HealthComponent implements IComponent {
    /**生命值*/
    health: number = 100;
    /**最大生命值*/
    maxHealth: number = 100;
    /**受击闪红计时*/
    flashTimer: number = 0;
    /**
     * 本帧是否受到伤害。
     * 由 DamageSystem 置位、MonsterStateSystem 消费并清掉。
     * 这是"事件型组件字段"的标准写法：生产者只置一次，消费者读后立即复位，
     * 避免用倒计时去猜"是不是刚被打到"。
     */
    hurtThisFrame: boolean = false;
    /**
     * 最近一次造成伤害的实体 id（-1 表示还没被打过）。
     * 用于击杀归属：谁打死的，积分记谁头上。
     * 必须是确定性的——伤害结算顺序固定，所以这个字段在各端一致。
     */
    /**
     * 造成最后一笔伤害的玩家实体 id（-1 表示还没被打过）。
     * 用于击杀归属：谁打死的，积分记谁头上。
     *
     * 存的是【玩家】而不是子弹：子弹命中后很快就会被回收销毁，
     * 存子弹 id 的话，等计分系统去查的时候实体可能已经没了。
     * 帧同步下伤害结算顺序固定，所以这个字段在各端一致。
     */
    lastKillerId: number = -1;
    /**
     * 是否已计过分。
     * 怪物血量归零后会保留 24 帧（倒地动画），这段时间里每帧都会被查询到，
     * 不做标记就会重复计分。
     */
    scored: boolean = false;
}