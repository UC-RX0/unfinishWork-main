
import { _decorator, Component, Node } from 'cc';
import { IWorld } from './Base/IWorld';
import { Entity, EntityPool } from './entity';
import { ComponentManager, SystemManager } from './tool';
import { gameParam } from '../core/game/GameSetting';
import { ISystem } from './Base/ISystem';
import { ComponentClass } from './tool/ComponentManager';
import { IComponent } from './Base/IComponent';
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
    //#region 实体API
    /**创建实体
     * @returns 新创建的实体的数据。
    */
    createEntity(): Entity {
        return this.entityPool.create();
    }
    /**
     * @description 销毁实体 并将其返回到实体池中。
     * 实体池会自动管理实体的内存，避免内存泄漏。
     * @param entity 实体对象
    */
    removeEntity(entity: Entity): void {
        //先从系统中移除实体
        this.componentManager.removeAllComponents(entity.id);
        this.entityPool.destroy(entity);
    }
    /**查询实体
     * 通过使用池提供的方法判断实体是否存活。
     * @returns 实体是否存活
    */
    isEntityAlive(entity: Entity): boolean {
        return this.entityPool.isAlive(entity);
    }
    //#endregion    

    //#region 组件API
    /**
     * @description 注册组件 
     * 用于在系统中使用组件。
     * 每个组件都有一个唯一的位索引，用于在位集中存储组件是否存在。
     * @param componentClass 组件类
     * @param bit 位索引 默认64位
    */
    registerComponent(componentClass: new (...args: any[]) => any, bit?: number): void {

        this.componentManager.registerComponent(componentClass, bit);
    }
    /**
     * @description 添加组件到实体
     * 用于为实体添加组件，使实体具备组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
    */
    addComp(entityId: number, componentClass: new (...args: any[]) => any): void {
        this.componentManager.addComponent(entityId, componentClass);
    }
    /**
     * @description 从实体中移除组件
     * 用于从实体中移除组件，使实体失去组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
    */
    removeComp(entityId: number, componentClass: new (...args: any[]) => any): void {
        this.componentManager.removeComponent(entityId, componentClass);
    }
    /**
     * @description 查询实体是否包含组件
     * 用于检查实体是否具备组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
     * @returns 实体是否包含组件
    */
    hasComp(entityId: number, componentClass: new (...args: any[]) => any): boolean {
        return this.componentManager.hasComponent(entityId, componentClass);
    }
    //#endregion
    //#region 系统API
    /**
     * @description 注册系统
     * 用于在世界中使用系统。
     * 每个系统都有一个唯一的优先级，用于在系统执行时按优先级排序。
     * @param systemClass 系统类
    */
    registerSystem(system: ISystem, priority: number): void {
        system.world = this;
        this.systemManager.registerSystem(system, priority);
    }

    getSystem(cls: new (...args: any[]) => ISystem): ISystem | undefined {
        return this.systemManager.getSystem(cls);
    }
    //开启或关闭系统
    enableOrDisable(cls: new (...args: any[]) => ISystem, enable: boolean): void {
        this.systemManager.enableOrDisable(cls, enable);
    }
    //#endregion
    //#region 接口API
    /**
     * @description 查询实体
     * 用于查询所有包含指定组件的实体。
     * @param componentClasses 组件类数组
     * @returns 包含指定组件的实体ID数组
    */
    query(...componentClasses: ComponentClass<any>[]): number[] {
        return this.componentManager.query(...componentClasses);
    }
    /**
     * @description 获取实体组件
     * 用于获取实体的指定组件。
     * @param entity 实体ID
     * @param componentClass 组件类
     * @returns 实体的指定组件
    */
    getComp<T extends IComponent>(entityId: number, componentClass: ComponentClass<T>): T | undefined {
        return this.componentManager.getComponent(entityId, componentClass);
    }
    //#endregion
}


