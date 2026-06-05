

export interface IWorld {
    query(...componentClasses: Function[]): number[];
    getComp<T>(entity: number, componentClass: new (...args: any[]) => T): T | undefined;
}