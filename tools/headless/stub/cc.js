/**
 * Cocos Creator 引擎的【运行时桩】
 *
 * headless 测试用：让 ECS 逻辑层能在 Node 里跑，不依赖编辑器。
 * 只需要覆盖 game/core 真正用到的那部分 API。
 */

'use strict';

//#region 数学类型
class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    set(x, y) { this.x = x; this.y = y; return this; }
    clone() { return new Vec2(this.x, this.y); }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    lengthSqr() { return this.x * this.x + this.y * this.y; }
    normalize() {
        const l = this.length();
        if (l > 0) { this.x /= l; this.y /= l; }
        return this;
    }
    equals(o) { return !!o && this.x === o.x && this.y === o.y; }
}
Vec2.ZERO = new Vec2(0, 0);

class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; if (z !== undefined) this.z = z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
    subtract(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    normalize() {
        const l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (l > 0) { this.x /= l; this.y /= l; this.z /= l; }
        return this;
    }
    equals(o) { return !!o && this.x === o.x && this.y === o.y && this.z === o.z; }
    static distance(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
Vec3.ZERO = new Vec3(0, 0, 0);
Vec3.UP = new Vec3(0, 1, 0);

class Color {
    constructor(r = 255, g = 255, b = 255, a = 255) { this.r = r; this.g = g; this.b = b; this.a = a; }
    set(v) { this.r = v.r; this.g = v.g; this.b = v.b; this.a = v.a; return this; }
}
Color.WHITE = new Color(255, 255, 255, 255);
Color.RED = new Color(255, 0, 0, 255);
Color.GREEN = new Color(0, 255, 0, 255);
//#endregion

//#region 节点与组件
class Node {
    constructor(name = '') {
        this.name = name;
        this.active = true;
        this.parent = null;
        this.children = [];
        this.position = new Vec3(0, 0, 0);
        this.angle = 0;
        this._components = new Map();
        this._destroyed = false;
        this._uid = ++Node._uid;
    }
    get isValid() { return !this._destroyed; }
    setParent(parent) {
        if (this.parent) {
            const i = this.parent.children.indexOf(this);
            if (i >= 0) this.parent.children.splice(i, 1);
        }
        this.parent = parent || null;
        if (parent) parent.children.push(this);
    }
    removeFromParent() { this.setParent(null); }
    setPosition(x, y, z) { this.position.set(x, y, z); }
    setScale(x, y, z) { this._scale = { x, y, z }; }
    getComponent(cls) {
        for (const c of this._components.values()) {
            if (c instanceof cls) return c;
        }
        return null;
    }
    addComponent(cls) {
        const c = new cls();
        c.node = this;
        this._components.set(c, cls);
        return c;
    }
    getChildByName(name) {
        for (const c of this.children) {
            if (c.name === name) return c;
        }
        return null;
    }
    getChildByPath(path) {
        let cur = this;
        for (const part of path.split('/')) {
            if (!part) continue;
            cur = cur.getChildByName(part);
            if (!cur) return null;
        }
        return cur;
    }
    destroy() {
        this._destroyed = true;
        this.setParent(null);
        this.children.length = 0;
    }
}
Node._uid = 0;

class Component {
    constructor() { this.node = null; this.enabled = true; }
}

class Sprite extends Component {
    constructor() { super(); this.spriteFrame = null; this.color = new Color(255, 255, 255, 255); }
}

class Animation extends Component {
    constructor() { super(); this._states = new Map(); this._clips = new Map(); }
    getState(name) { return this._states.get(name); }
    addClip(clip, name) {
        const key = name || (clip && clip.name);
        this._clips.set(key, clip);
        this._states.set(key, { isPlaying: false, wrapMode: 0, name: key });
    }
    play(name) {
        const s = this._states.get(name);
        if (s) s.isPlaying = true;
        return s;
    }
    stop() {
        for (const s of this._states.values()) s.isPlaying = false;
    }
}

class UITransform extends Component {
    constructor() { super(); this.width = 0; this.height = 0; }
}
class Widget extends Component { }
class BlockInputEvents extends Component { }
class Camera extends Component { }
//#endregion

//#region 资源
class Asset { constructor(name = '') { this.name = name; } }
class Prefab extends Asset { }
class SpriteFrame extends Asset { }
class AnimationClip extends Asset { }
class JsonAsset extends Asset { }

class AssetManager {
    loadRemote(url, onComplete) { if (onComplete) onComplete(null, new Asset()); }
    getBundle() { return null; }
}

const resources = {
    load(url, type, onComplete) { if (onComplete) onComplete(null, new Asset()); },
    loadDir(url, type, onComplete) { if (onComplete) onComplete(null, []); },
    get() { return null; },
};

function instantiate(obj) {
    if (obj instanceof Node) return obj;
    const n = new Node('instance');
    return n;
}
function find(path) { return null; }
function destroy(node) { if (node) node.destroy(); }
//#endregion

//#region 其它
const director = {
    getScene() { return sceneRoot; },
    loadScene(url, onComplete) { if (onComplete) onComplete(null, sceneRoot); },
    addPersistRootNode() { },
};
const sceneRoot = new Node('Scene');
sceneRoot.getChildByName = (name) => {
    for (const c of sceneRoot.children) if (c.name === name) return c;
    return null;
};

const _decorator = {
    ccclass: (name) => (target) => { target.__className = name; return target; },
    property: () => () => { },
    executeInEditMode: () => () => { },
    requireComponent: () => () => { },
};
//#endregion

module.exports = {
    Vec2, Vec3, Color,
    Node, Component, Sprite, Animation, UITransform, Widget, BlockInputEvents, Camera,
    Asset, Prefab, SpriteFrame, AnimationClip, JsonAsset, AssetManager,
    resources, assetManager: new AssetManager(),
    instantiate, find, destroy,
    director, sp: {}, _decorator, __private: {}, sys: {}, game: {},
    log: console.log, warn: console.warn, error: console.error,
    sceneRoot,
};
