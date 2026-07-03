import { Prefab } from "cc";
import { IComponent } from "../Base/IComponent";
import { Entity } from "../entity";


export class BulletComponent implements IComponent {
    
    
    /**子弹信息*/
    entity: Entity = null;
}
