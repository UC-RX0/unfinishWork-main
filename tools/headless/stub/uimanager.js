/**
 * UIManager 的运行时桩（headless 测试用）
 *
 * 编辑器里 uiMgr 负责创建五个层级节点；headless 下没有渲染，
 * 直接返回一个占位节点即可，避免刷"UI管理器未初始化"的噪音。
 */

'use strict';

const path = require('path');
const { Node } = require('./cc.js');

// 真实的 UIManager 会把 PathEnum / UIEnum 从 ResEnum 再导出一次，
// 这里保持同样的行为，否则引用方拿不到这两个枚举
const ResEnum = require(path.resolve(
    __dirname, '../../../temp/headless-build/assets/Script/core/resource/ResEnum.js'));

/**与真实 UIManager 保持一致的枚举值*/
const LayerEnum = {
    MainLayer: 1,
    GameLayer: 2,
    PopupLayer: 3,
    GuideLayer: 4,
    LockLayer: 5,
};

const layers = new Map();
for (const key of Object.keys(LayerEnum)) {
    layers.set(LayerEnum[key], new Node(key));
}

const uiMgr = {
    init() { },
    getLayer(layer) { return layers.get(layer) || null; },
    register() { },
    showUI() { },
    get isInit() { return true; },
};

module.exports = { uiMgr, LayerEnum, PathEnum: ResEnum.PathEnum, UIEnum: ResEnum.UIEnum };
