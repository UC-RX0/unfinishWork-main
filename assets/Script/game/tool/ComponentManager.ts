import { Component } from 'cc';
import { __private } from 'cc';
import { IComponent } from "../Base/IComponent";
import { BitSet } from "./BitSet";
import { ComponentArray } from "./ComponentArray";
//组件类
export type ComponentClass<T extends IComponent> = new () => T;
export class ComponentManager {
    /**组件数组映射表*/
    private componentArrays: Map<ComponentClass<any>, ComponentArray<IComponent>> = new Map();
    /**组件类到位索引的映射表*/
    private componentBitIndices: Map<ComponentClass<any>, number> = new Map();
    /**实体id到位组件位的映射表*/
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
    addComponent<T extends IComponent>(entityId: number, cls: ComponentClass<T>): IComponent {
        if (!this.componentArrays.has(cls)) {
            //意味着这个组件没有被注册过,需要先注册
            this.registerComponent(cls);
        }
        let componentArray = this.componentArrays.get(cls);
        //每个实体添加的时候都是只往里添加组件类型 并非实例 所以需要New一个组件实例
        let component = new cls();
        //仅放相同的组件类型和实体ID
        componentArray.addData(entityId, component);
        /**
         * componentBitIndices 使用位索引记录是否有这个组件类型（由registerComponent方法注册时注入的位索引）
         * entitySignature 使用实体Id与位索引做映射记录实体是否有这个组件类型
        */
        let bit = this.componentBitIndices.get(cls);
        if (bit !== undefined) {
            let signature = this.entitySignature.get(entityId);
            if (signature === undefined) {
                signature = new BitSet();
                this.entitySignature.set(entityId, signature);
            }
            signature.set(bit);
        }
        return component;
    }
    removeComponent<T extends IComponent>(entityId: number, component: ComponentClass<T>) {
        let componentArray = this.componentArrays.get(component);
        if (!componentArray) return;
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
    getComp<T extends IComponent>(entityId: number, component: ComponentClass<T>): T | undefined {
        let componentArray = this.componentArrays.get(component);
        if (!componentArray) {
            return;
        }
        let componentData = componentArray.getData(entityId);
        return componentData as T;
    }
    //批量获取组件数据
    query(...componentClasses: ComponentClass<any>[]): number[] {
        let result: number[] = [];
        let requiredBits: number[] = [];
        for (let component of componentClasses) {
            let bit = this.componentBitIndices.get(component);
            if (bit === undefined) {
                return [];
            }
            requiredBits.push(bit);
        }
        for (let [entityId, signature] of this.entitySignature) {
            let match = true;
            for (let bit of requiredBits) {
                if (!signature.has(bit)) {
                    match = false;
                    break;
                }
            }
            if (match) {
                result.push(entityId);
            }
        }
        return result;
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
    clean() {
        this.componentArrays.clear();
        this.componentBitIndices.clear();
        this.entitySignature.clear();
        this.nextBitIndex = 0;
    }


}