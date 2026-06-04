import { IComponent } from "../Base/IComponent";
//作为组件数组的标记  用于存放相同类型的Component 但是不同的ID
export class ComponentArray<T extends IComponent> {
    // public components: IComponent[] = [];
    public data: Map<number, T> = new Map();
    //添加组件的number表示是位掩码
    addData(id: number, component: T) {
        this.data.set(id, component);
    }
    removeData(id: number) {
        this.data.delete(id);
    }
    getData(id: number): T | undefined {
        return this.data.get(id);
    }
    hasData(id: number): boolean {
        return this.data.has(id);
    }
    size(): number {
        return this.data.size;
    }
    clear() {
        this.data.clear();
    }
}