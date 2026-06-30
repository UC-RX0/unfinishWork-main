import { Prefab } from "cc";
import { IComponent } from "../Base/IComponent";



export class WeaponComponent implements IComponent {
    /**攻击间隔*/
    fireInterval: number = 0.5;
    /**计时器*/
    timer: number = 0;
}