import { IComponent } from "../Base/IComponent";



export class HealthComponent implements IComponent {
    /**生命值*/
    health: number = 100;
    /**最大生命值*/
    maxHealth: number = 100;
    /**受击闪红计时*/
    flashTimer: number = 0;
}