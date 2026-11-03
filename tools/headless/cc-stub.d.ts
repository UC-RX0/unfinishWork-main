/**
 * Cocos Creator 引擎的【最小桩声明】
 *
 * 用途：让 ECS 逻辑层能在 Node 里跑起来，从而：
 *   - 不依赖编辑器就能做确定性与联机回归测试
 *   - 两个 headless 客户端可以同时连服务端，验证端到端锁步
 *
 * 只声明 game/core 真正用到的东西，多了没用。
 */

//#region 数学类型
export class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): Vec2;
    clone(): Vec2;
    length(): number;
    lengthSqr(): number;
    normalize(): Vec2;
    equals(other: Vec2): boolean;
    static readonly ZERO: Vec2;
}

export class Vec3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z?: number): Vec3;
    clone(): Vec3;
    subtract(v: Vec3): Vec3;
    add(v: Vec3): Vec3;
    normalize(): Vec3;
    equals(other: Vec3): boolean;
    static distance(a: Vec3, b: Vec3): number;
    static readonly ZERO: Vec3;
    static readonly UP: Vec3;
}

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    set(v: Color): Color;
    static readonly WHITE: Color;
    static readonly RED: Color;
    static readonly GREEN: Color;
}
//#endregion

//#region 节点与组件
export class Node {
    name: string;
    active: boolean;
    parent: Node;
    children: Node[];
    position: Vec3;
    angle: number;
    readonly isValid: boolean;
    constructor(name?: string);
    setParent(parent: Node): void;
    removeFromParent(): void;
    setPosition(x: number, y: number, z?: number): void;
    setScale(x: number, y: number, z?: number): void;
    getComponent<T>(cls: any): T;
    addComponent<T>(cls: any): T;
    getChildByPath(path: string): Node;
    getChildByName(name: string): Node;
    destroy(): void;
}

export class Component {
    node: Node;
    enabled: boolean;
}

export class Sprite extends Component {
    spriteFrame: SpriteFrame;
    color: Color;
}

export class Animation extends Component {
    enabled: boolean;
    getState(name: string): any;
    addClip(clip: any, name?: string): void;
    play(name: string): any;
    stop(): void;
}

export class UITransform extends Component {
    width: number;
    height: number;
}

export class Widget extends Component { }
export class BlockInputEvents extends Component { }
export class Camera extends Component { }
//#endregion

//#region 资源
export class Asset {
    name: string;
}
export class Prefab extends Asset { }
export class SpriteFrame extends Asset { }
export class AnimationClip extends Asset { }
export class JsonAsset extends Asset { }

export class AssetManager {
    loadRemote<T>(url: string, onComplete: (err: any, asset: T) => void): void;
    getBundle(name: string): any;
}

export const resources: any;
export const assetManager: AssetManager;
export function instantiate<T>(obj: any): T;
export function find(path: string): Node;
export function destroy(node: Node): void;
//#endregion

//#region 其它
export const director: {
    getScene(): any;
    loadScene(url: string, onComplete?: (err: any, scene?: any) => void): void;
    addPersistRootNode(node: Node): void;
};
export const sp: any;
export const _decorator: {
    ccclass(name?: string): any;
    property(options?: any): any;
    executeInEditMode(target?: any, key?: string, descriptor?: any): any;
    requireComponent(...cls: any[]): any;
};
export const __private: any;
export const sys: any;
export const game: any;
export const log: any;
export const warn: any;
export const error: any;
//#endregion
