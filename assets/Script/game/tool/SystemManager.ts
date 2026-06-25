import { ISystem } from "../Base/ISystem";
export class SystemManager {
    //系统列表
    private systems: ISystem[] = [];
    //是否需要重新排序 按照priority排序
    needsSort: boolean = false;

    registerSystem(system: ISystem, priority: number) {
        system.priority = priority;
        this.systems.push(system);
        if (this.systems.length > 1) this.needsSort = true;
        this.sortSystems();
    }
    unregisterSystem(cls: new (...args: any[]) => ISystem) {
        this.systems = this.systems.filter((system) => system.constructor !== cls);
        if (this.systems.length > 1) this.needsSort = true;
        this.sortSystems();
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
}