import { _decorator, Component, Node } from 'cc';
import { IWorld } from './Base/IWorld';
import { EntityPool } from './entity';
import { ComponentManager, SystemManager } from './tool';
import { gameParam } from '../core/game/GameSetting';




/**
 *@description 世界类
 * 作为ECS框架的核心 需要统管所有System
 * 核心职责是 负责EC的CRUD操作
 * 并调度所有System的执行
 **/

export class World extends Component implements IWorld {

    private entityPool: EntityPool;
    private componentManager: ComponentManager;
    private systemManager: SystemManager;


    private lastUpdateTime: number = 0;

    onLoad() {
        this.entityPool = new EntityPool();
        this.componentManager = new ComponentManager();
        this.systemManager = new SystemManager();
        // this.systemManager.init();
    }
    onDestroy() {
        this.entityPool = null;
        this.componentManager = null;
        this.systemManager = null;
    }


    update(dt: number) {
        //统一时间步长为帧率 可由GameSetting配置
        this.lastUpdateTime += dt;
        if (this.lastUpdateTime >= gameParam.DT) {
            this.lastUpdateTime -= gameParam.DT;
            this.systemManager.update(gameParam.DT);
        }
    }
    /**创建实体*/
    //#region 实体API
    createEntity() { 
        re
    }
    /**销毁实体*/
    removeEntity(entity: number) { }
    /**查询实体*/
    isEntityAlive() { }
    //#endregion    


    //#region 组件API
    registerComponent() { }
    addComp() { }
    removeComp() { }
    hasComp() { }
    /**属于组件API*/
    getComp2() { }
    //#endregion

    //#region 系统API
    registerSystem() { }

    getSystem() { }
    //#endregion


    //#region 接口API
    query(...componentClasses: Function[]): number[] {
        return [];
    }
    getComp<T>(entity: number, componentClass: new (...args: any[]) => T): T | undefined {
        return null;
    }

    //#endregion


}


