import { Prefab } from "cc";
import { IComponent } from "../Base/IComponent";



export class WeaponComponent implements IComponent {
    /**攻击间隔*/
    fireInterval: number = 0.5;
    /**计时器*/
    timer: number = 0;
    /**子弹速度*/
    bulletSpeed: number = 300;
    /**子弹存活时间*/
    bulletLifeTime: number = 3;
    /**子弹预制体*/
    bulletPrefab: Prefab = null;
    /**子弹射击角度*/
    bulletAngle: number = 0;
}