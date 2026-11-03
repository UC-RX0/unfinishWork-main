/**
 * ResBridge 的运行时桩（headless 测试用）
 *
 * headless 环境里没有 Cocos 资源系统，这里提供行为等价的假资源：
 *   - getFrames 返回指定数量的假 SpriteFrame
 *   - spawn 返回一个假节点
 *   - 逻辑接口全部走真实实现（除了资源本身）
 */

'use strict';

const { Node } = require('./cc.js');

/**各序列帧目录的帧数，与真实资源保持一致*/
const FRAME_COUNT = {
    'texture/actor/idle': 6,
    'texture/actor/run': 6,
    'texture/weapon/weapon1/idle': 1,
    'texture/weapon/weapon1/attack': 7,
    'texture/bullet/bullet2': 1,
    'texture/explosion': 7,
};

function makeFrame(name) {
    return { name, __isSpriteFrame: true };
}

const resBridge = {
    isReady: true,

    async boot(onProgress) {
        if (onProgress) onProgress({ ratio: 1, label: 'headless-stub' });
    },

    assertReady() { /* headless 下没有资源加载，直接放行 */ },

    getFrames(key) {
        const n = FRAME_COUNT[key] || 0;
        const arr = [];
        for (let i = 0; i < n; i++) arr.push(makeFrame(`${key}#${i}`));
        return arr;
    },

    getPrefab(key, name) {
        return { name: name || key, __isPrefab: true };
    },

    getAsset(key, name) {
        return { name: name || key };
    },

    getClip(name) {
        return { name, __isClip: true };
    },

    spawn(key, name) {
        return new Node(name || key);
    },

    recycle() { },
};

module.exports = {
    resBridge,
    BootPhase: { Idle: 0, Loading: 1, Sealed: 2 },
};
