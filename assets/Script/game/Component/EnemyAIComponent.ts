import { IComponent } from "../Base/IComponent";


export class EnemyAIComponent implements IComponent {
    /**
     * 到最近玩家的【距离平方】，由 AISystem 每帧写入。
     * 用平方而不是距离：比较时只需一次乘法，省掉每帧的开方。
     * 判断是否进入攻击范围时与 attackRange*attackRange 比较。
     */
    distanceSqToTarget: number = Number.MAX_VALUE;
}