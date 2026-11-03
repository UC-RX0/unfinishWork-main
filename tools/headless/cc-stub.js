'use strict';

/**
 * Cocos Creator 引擎【运行时桩】—— 与 cc-stub.d.ts 配套
 *
 * 用途：把 "cc" 这个模块在 Node 里替换成这个文件，让 ECS 逻辑层能在
 *       headless 环境跑起来，从而做确定性回归测试、双客户端锁步测试。
 *
 * 对齐原则（非常重要）：
 *   这里的方法必须【模拟真实引擎的行为】，而不是"能跑就行"。
 *   比如 Vec2.normalize() 在真引擎里是原地归一化并返回自己，
 *   如果桩里写成返回新对象，测试全绿但引擎里逻辑就错了 —— 桩骗了你。
 *   拿不准的 API 就去翻引擎源码，别猜。
 *
 * 只实现项目真正用到的部分。缺什么补什么，不要提前写。
 */

//#region 数学
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    lengthSqr() {
        return this.x * this.x + this.y * this.y;
    }
    /**原地归一化并返回自身 —— 与真实引擎一致 */
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
    equals(other) {
        return !!other && this.x === other.x && this.y === other.y;
    }
}
Vec2.ZERO = new Vec2(0, 0);

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    normalize() {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (len > 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }
    equals(other) {
        return !!other && this.x === other.x && this.y === other.y && this.z === other.z;
    }
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
Vec3.ZERO = new Vec3(0, 0, 0);
Vec3.UP = new Vec3(0, 1, 0);

class Color {
    constructor(r = 255, g = 255, b = 255, a = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    set(v) {
        this.r = v.r;
        this.g = v.g;
        this.b = v.b;
        this.a = v.a;
        return this;
    }
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
}
Color.WHITE = new Color(255, 255, 255, 255);
Color.RED = new Color(255, 0, 0, 255);
Color.GREEN = new Color(0, 255, 0, 255);
Color.BLACK = new Color(0, 0, 0, 255);
//#endregion

//#region 节点与组件
class Component {
    constructor() {
        this.node = null;
        this.enabled = true;
    }
}

class Node {
    constructor(name = '') {
        this.name = name;
        this.active = true;
        this.parent = null;
        this.children = [];
        this.position = new Vec3();
        this.angle = 0;
        this._isValid = true;
        this._components = [];
    }
    get isValid() {
        return this._isValid;
    }
    setParent(parent) {
        if (this.parent) {
            const i = this.parent.children.indexOf(this);
            if (i >= 0) this.parent.children.splice(i, 1);
        }
        this.parent = parent || null;
        if (parent) parent.children.push(this);
    }
    removeFromParent() {
        this.setParent(null);
    }
    setPosition(x, y, z = 0) {
        this.position.set(x, y, z);
    }
    setScale() {
        /* headless 下不关心缩放 */
    }
    addComponent(cls) {
        const comp = new cls();
        comp.node = this;
        this._components.push(comp);
        return comp;
    }
    getComponent(cls) {
        for (let i = 0; i < this._components.length; i++) {
            if (this._components[i] instanceof cls) return this._components[i];
        }
        return null;
    }
    getChildByName(name) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].name === name) return this.children[i];
        }
        return null;
    }
    getChildByPath(path) {
        const parts = String(path).split('/');
        let cur = this;
        for (let i = 0; i < parts.length && cur; i++) {
            if (parts[i]) cur = cur.getChildByName(parts[i]);
        }
        return cur;
    }
    removeAllChildren() {
        this.children.length = 0;
    }
    destroy() {
        this._isValid = false;
        this.removeFromParent();
    }
}

class Sprite extends Component {}
class Animation extends Component {
    getState() {
        return null;
    }
    addClip() {}
    play() {
        return null;
    }
    stop() {}
}
class UITransform extends Component {
    constructor() {
        super();
        this.width = 0;
        this.height = 0;
    }
}
class Widget extends Component {}
class BlockInputEvents extends Component {}
class Camera extends Component {}
class UIOpacity extends Component {
    constructor() {
        super();
        this.opacity = 255;
    }
}
class Label extends Component {
    constructor() {
        super();
        this.string = '';
    }
}
class RigidBody2D extends Component {}
class Collider2D extends Component {}
class Graphics extends Component {}
//#endregion

//#region 资源
class Asset {
    constructor(name = '') {
        this.name = name;
    }
}
class Prefab extends Asset {}
class SpriteFrame extends Asset {}
class AnimationClip extends Asset {}
class JsonAsset extends Asset {}
class AudioClip extends Asset {}

const assetManager = {
    loadRemote(url, onComplete) {
        if (onComplete) onComplete(new Error('[cc-stub] loadRemote 未实现'), null);
    },
    getBundle() {
        return null;
    },
};

const resources = {
    load() {},
    loadDir() {},
};
//#endregion

//#region 装饰器
const _decorator = {
    /** 类装饰器：@ccclass('Name') */
    ccclass(name) {
        return function (target) {
            return target;
        };
    },
    /** 属性装饰器：@property 或 @property(Type) 或 @property({...}) */
    property(...args) {
        return function () {};
    },
    executeInEditMode() {
        return function (target) {
            return target;
        };
    },
    requireComponent() {
        return function (target) {
            return target;
        };
    },
    menu() {
        return function (target) {
            return target;
        };
    },
    disallowMultiple() {
        return function (target) {
            return target;
        };
    },
};
//#endregion

//#region 其它
const director = {
    /** headless 没有场景 —— 返回 null，让依赖场景的探针代码安全跳过 */
    getScene() {
        return null;
    },
    loadScene(url, onComplete) {
        if (onComplete) onComplete(null, null);
    },
    addPersistRootNode() {},
};

const game = {
    frameRate: 60,
    on() {},
    off() {},
};

class EventTarget {
    constructor() {
        this._listeners = new Map();
    }
    on(type, cb) {
        if (!this._listeners.has(type)) this._listeners.set(type, []);
        this._listeners.get(type).push(cb);
    }
    off(type, cb) {
        const arr = this._listeners.get(type);
        if (!arr) return;
        const i = arr.indexOf(cb);
        if (i >= 0) arr.splice(i, 1);
    }
    emit(type, ...args) {
        const arr = this._listeners.get(type);
        if (!arr) return;
        for (let i = 0; i < arr.length; i++) arr[i](...args);
    }
    targetOff() {
        this._listeners.clear();
    }
}

function instantiate(obj) {
    // headless 下不复制节点，直接返回原对象，避免测试里出现"幽灵节点"
    return obj;
}

function find() {
    return null;
}

function destroy(node) {
    if (node && node.destroy) node.destroy();
}

const sys = {
    platform: 0,
    os: 'headless',
    isMobile: false,
    isBrowser: false,
    isNative: false,
    localStorage: {
        getItem() {
            return null;
        },
        setItem() {},
        removeItem() {},
    },
};
//#endregion

module.exports = {
    Vec2,
    Vec3,
    Color,
    Node,
    Component,
    Sprite,
    Animation,
    UITransform,
    Widget,
    BlockInputEvents,
    Camera,
    UIOpacity,
    Label,
    RigidBody2D,
    Collider2D,
    Graphics,
    Asset,
    Prefab,
    SpriteFrame,
    AnimationClip,
    JsonAsset,
    AudioClip,
    assetManager,
    resources,
    _decorator,
    director,
    game,
    EventTarget,
    instantiate,
    find,
    destroy,
    sys,
    // ComponentManager 里 import 了但没用到，补上避免 undefined
    __private: {},
    log: console.log,
    warn: console.warn,
    error: console.error,
};
