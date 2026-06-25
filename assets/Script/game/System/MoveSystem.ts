
import { ISystem } from "../Base/ISystem";
import { IWorld } from "../Base/IWorld";
import { ComponentClass } from "../tool/ComponentManager";



export class MoveSystem extends ISystem {
    
    // requiredComponents: ComponentClass<any>[] = [PosComponent, VelocityComponent];
     requiredComponents: ComponentClass<any>[] = [];
    //会在初始化的时候去查询所有需要的组件类
    //或者看World 是否会带有数据注入的方法
    //有待后续讨论实现
    init() {

    }

    update(dt: number) {

    }
} 