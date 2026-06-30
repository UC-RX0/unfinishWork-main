import { Prefab } from "cc";
import { IComponent } from "../Base/IComponent";
import { Entity } from "../entity";


export class BulletComponent implements IComponent {
    /**子弹速度*/
    speed: number = 300;
    /**子弹伤害*/
    damage: number = 10;
    /**子弹生命周期 飞行2秒后销毁*/
    lifeTime: number = 2;
    /**子弹信息*/
    entity: Entity = null;
}
