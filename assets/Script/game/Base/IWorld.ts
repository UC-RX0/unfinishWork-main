import { Entity } from "../entity";
import { ISystem } from "./ISystem";
import { FrameInput } from "../Input/FrameInput";
import { IWorldSnapshot } from "../tool/Snapshot";


export interface IWorld {
    /**
     * 当前逻辑帧号。
     * 系统内所有"持续多少帧"的逻辑（状态时长、动画帧龄、冷却）都必须基于它，
     * 不允许直接使用渲染 dt —— 这是接帧同步的前提。
     */
    readonly frame: number;
    /**当前是否为联机模式（联机时禁用与回滚冲突的手工自检）*/
    readonly networkMode: boolean;
    //#region 生命周期
    /**初始化世界（重建各管理器、注册系统）*/
    init(): void;
    /**销毁世界*/
    onDestroy(): void;
    /**当前参与同步的玩家数量*/
    getPlayerCount(): number;
    //#endregion
    //#region 输入
    /**
     * 取第 frame 帧指定玩家的输入。
     * 逻辑层读输入的唯一入口 —— 不允许任何 System 再去碰 inputMgr，
     * 否则输入就没有帧归属，追帧和回滚都会算错。
     */
    getInput(frame: number, playerIndex: number): FrameInput | null;
    //#endregion
    //#region 快照 / 回滚
    /**导出整个逻辑世界的快照（预测+回滚的地基）*/
    captureSnapshot(): IWorldSnapshot;
    /**还原整个逻辑世界（回滚）*/
    restoreSnapshot(snapshot: IWorldSnapshot): void;
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
    /**查询所有实体 id（重开一局时用来销毁全部实体）*/
    getAllEntityIds(): number[];
    /**获取组件*/
    getComp<T>(entityId: number, componentClass: new (...args: any[]) => T): T | undefined;
    //#endregion
    //#region 系统管理
    registerSystem(system: ISystem, priority: number): void
    getSystem(cls: new (...args: any[]) => ISystem): ISystem | undefined
    enableOrDisable(cls: new (...args: any[]) => ISystem, enable: boolean): void
}