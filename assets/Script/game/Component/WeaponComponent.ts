import { v2, Vec2 } from "cc";
import { IComponent } from "../Base/IComponent";

export class WeaponComponent implements IComponent {
   
    /**子弹速度*/
    bulletSpeed: number = 300;
    /**武器朝向方向（360°单位向量），由WeaponSyncSystem每帧更新*/
    aimDirection: Vec2 = v2(1, 0);
}