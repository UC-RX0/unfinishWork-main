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
}