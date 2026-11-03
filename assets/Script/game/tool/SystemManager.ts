import { ISystem } from "../Base/ISystem";
import { ISystemState } from "./Snapshot";
export class SystemManager {
    //系统列表
    private systems: ISystem[] = [];
    //是否需要重新排序 按照priority排序
    needsSort: boolean = false;

    registerSystem(system: ISystem, priority: number) {
        system.priority = priority;
        system.init();
        this.systems.push(system);
        if (this.systems.length > 1) this.needsSort = true;
        this.sortSystems();
    }
    unregisterSystem(cls: new (...args: any[]) => ISystem) {
        this.systems = this.systems.filter((system) => system.constructor !== cls);
        if (this.systems.length > 1) this.needsSort = true;
        this.sortSystems();
    }
    //开启或关闭系统
    enableOrDisable(cls: new (...args: any[]) => ISystem, enable: boolean) {
        let system = this.getSystem(cls);
        if (system) {
            system.enableOrDisable(enable);
        }
    }
    update(dt: number) {
        this.sortSystems();
        //执行系统
        for (let system of this.systems) {
            if (system.enable) {
                system.update(dt);
            }
        }
    }
    sortSystems() {
        if (!this.needsSort) {
            return;
        }
        //根据priority升序排序，优先级低的先执行，高的是后执行
        this.systems.sort((a, b) => a.priority - b.priority);
        this.needsSort = false;
    }
    getSystem(cls: new (...args: any[]) => ISystem): ISystem | undefined {
        return this.systems.find((system) => system.constructor === cls);
    }
    clean() {

        this.systems = [];
        this.needsSort = false;
    }

    //#region 快照 / 回滚
    /**导出所有系统的自定义状态*/
    public captureState(): ISystemState[] {
        const out: ISystemState[] = [];
        for (let i = 0; i < this.systems.length; i++) {
            const system = this.systems[i];
            const data = system.captureState();
            if (data !== null && data !== undefined) {
                out.push({ system, data });
            }
        }
        return out;
    }

    /**还原所有系统的自定义状态*/
    public restoreState(list: ISystemState[]): void {
        for (let i = 0; i < list.length; i++) {
            list[i].system.restoreState(list[i].data);
        }
    }
    //#endregion
}