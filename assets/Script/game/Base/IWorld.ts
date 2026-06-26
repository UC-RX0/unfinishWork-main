import { Entity } from "../entity";
import { ISystem } from "./ISystem";


export interface IWorld {
    //#region 实体管理
    /**创建实体*/
    createEntity(): Entity;
    /**销毁实体*/
    removeEntity(entity: Entity): void
    /**判断实体是否存活*/
    isEntityAlive(entity: Entity): boolean
    //#endregion
    //#region 组件管理
    /**注册组件*/
    registerComponent(componentClass: new (...args: any[]) => any, bit?: number): void
    /**添加组件*/
    addComp(entityId: number, componentClass: new (...args: any[]) => any): void
    /**移除组件*/
    removeComp(entityId: number, componentClass: new (...args: any[]) => any): void
    /**判断实体是否有组件*/
    hasComp(entityId: number, componentClass: new (...args: any[]) => any): boolean
    /**查询实体id列表*/
    query(...componentClasses: Function[]): number[];
    /**获取组件*/
    getComp<T>(entityId: number, componentClass: new (...args: any[]) => T): T | undefined;
    //#endregion
    //#region 系统管理
    registerSystem(system: ISystem, priority: number): void
    getSystem(cls: new (...args: any[]) => ISystem): ISystem | undefined
    enableOrDisable(cls: new (...args: any[]) => ISystem, enable: boolean): void
}