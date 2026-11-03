import { Entity } from "../entity";
import { ISystem } from "./ISystem";
import { FrameInput } from "../Input/FrameInput";


export interface IWorld {
    /**
     * 当前逻辑帧号。
     * 系统内所有"持续多少帧"的逻辑（状态时长、动画帧龄、冷却）都必须基于它，
     * 不允许直接使用渲染 dt —— 这是接帧同步的前提。
     */
    readonly frame: number;
    //#region 输入
    /**
     * 取第 frame 帧指定玩家的输入。
     * 逻辑层读输入的唯一入口 —— 不允许任何 System 再去碰 inputMgr，
     * 否则输入就没有帧归属，追帧和回滚都会算错。
     */
    getInput(frame: number, playerIndex: number): FrameInput | null;
    //#endregion
    //#region 实体管理
    /**创建实体*/
    createEntity(): Entity;
    /**销毁实体*/
    removeEntity(entity: Entity): void
    /**通过ID销毁实体*/
    removeEntityById(entityId: number): void
    /**判断实体是否存活*/
    isEntityAlive(entity: Entity): boolean
    //#endregion
    //#region 组件管理
    /**注册组件*/
    registerComponent(componentClass: new (...args: any[]) => any, bit?: number): void
    /**添加组件*/
    addComp<T>(entityId: number, componentClass: new (...args: any[]) => T): T | undefined;
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