import { IComponent } from "../Base/IComponent";

export class WeaponComponent implements IComponent {
    /**攻击间隔*/
    fireInterval: number = 0.5;
    /**计时器*/
    timer: number = 0;
    /**子弹速度*/
    bulletSpeed: number = 300;
    /**武器当前角度（度）*/
    angle: number = 0;
}