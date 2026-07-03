import { IComponent } from "../Base/IComponent";


export class DamageComponent implements IComponent {
    /**子弹伤害*/
    damage: number = 0;
    static DEFAULT_RADIUS: number = 70;


}