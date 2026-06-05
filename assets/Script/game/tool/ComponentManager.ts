import { __private } from 'cc';
import { IComponent } from "../Base/IComponent";
import { BitSet } from "./BitSet";
import { ComponentArray } from "./ComponentArray";
export type ComponentClass<T extends IComponent> = new () => T;
export class ComponentManager {
    private componentArrays: Map<ComponentClass<any>, ComponentArray<IComponent>> = new Map();
    private componentBitIndices: Map<ComponentClass<any>, number> = new Map();
    private entitySignature: Map<number, BitSet> = new Map();

    private nextBitIndex: number = 0;
    registerComponent(cls: ComponentClass<any>, bit?: number) {
        if (bit === undefined) {
            bit = this.nextBitIndex++;
        }
        let componentArray = new ComponentArray<IComponent>();
        this.componentArrays.set(cls, componentArray);
        this.componentBitIndices.set(cls, bit);
    }
    addComponent<T extends IComponent>(entityId: number, cls: ComponentClass<T>) {
        if (!this.componentArrays.has(cls)) {
            //意味着这个组件没有被注册过,需要先注册
            this.registerComponent(cls);
        }
        let componentArray = this.componentArrays.get(cls);
        let component = new cls();
        componentArray.addData(entityId, component);
        let bit = this.componentBitIndices.get(cls);
        if (bit !== undefined) {
            let signature = this.entitySignature.get(entityId);
            if (signature === undefined) {
                signature = new BitSet();
                this.entitySignature.set(entityId, signature);
            }
            signature.set(bit);
        }
    }
    removeComponent<T extends IComponent>(entityId: number, component: ComponentClass<T>) {
        let componentArray = this.componentArrays.get(component);
        if (!componentArray) {
            return;
        }
        componentArray.removeData(entityId);
        let bit = this.componentBitIndices.get(component);
        if (bit !== undefined) {
            let signature = this.entitySignature.get(entityId);
            if (signature) {
                signature.clear(bit);
            }
        }
    }
    //这是检索ComponentArrary的复合方法
    getComponent<T extends IComponent>(entityId: number, component: ComponentClass<T>): T | undefined {
        let componentArray = this.componentArrays.get(component);
        if (!componentArray) {
            return;
        }
        let componentData = componentArray.getData(entityId);
        return componentData as T;
    }
    //这是检索ComponentArrary的复合方法
    hasComponent<T extends IComponent>(entityId: number, component: ComponentClass<T>): boolean {
        let componentArray = this.componentArrays.get(component);
        if (!componentArray) {
            return false;
        }
        let componentData = componentArray.hasData(entityId);
        return componentData;
    }
    removeAllComponents(entityId: number) {
        for (let componentArray of this.componentArrays.values()) {
            componentArray.removeData(entityId);
        }
        this.entitySignature.delete(entityId);

    }
}