"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTree = exports.postOrder = exports.hit = exports.clamp = exports.uuid = exports.getParentCls = void 0;
// 获取父类构造函数(ts:constructor === class)
const getParentCls = (cls) => { var _a; return cls && ((_a = cls.prototype.__proto__) === null || _a === void 0 ? void 0 : _a.constructor); };
exports.getParentCls = getParentCls;
// 生成节点uuid
const uuid = () => Editor.Utils.UUID.generate();
exports.uuid = uuid;
// 防止越界
const clamp = (value, max, min) => (value < min ? min : value > max ? max : value);
exports.clamp = clamp;
// 是否命中
const hit = (x, y, targetX, targetY, targetW, targetH) => x > targetX && y > targetY && x < targetX + targetW && y < targetY + targetH;
exports.hit = hit;
/***
 * N叉树的倒序遍历
 */
const postOrder = function (root) {
    if (!root) {
        return [];
    }
    var stack = [root];
    var stack2 = [];
    var result = [];
    while (stack.length) {
        const node = stack.pop();
        stack2.push(node);
        for (let i = 0; i < node.children.length; i++) {
            stack.push(node.children[i]);
        }
    }
    while (stack2.length) {
        result.push(stack2.pop());
    }
    return result;
};
exports.postOrder = postOrder;
/**
 * 数组转树，返回根节点
 * @param nodes
 * @returns root
 */
const buildTree = (nodes) => {
    const nodeIdMap = new Map();
    let root = null;
    // 记录id和node数据的映射
    for (const node of nodes) {
        if (node.isRoot) {
            root = node;
        }
        nodeIdMap.set(node.id, node);
    }
    // 没有根节点
    if (!root) {
        return null;
    }
    // 把children中的Id换成真正的node数据
    for (const node of nodes) {
        node.children = node.children.map((childId) => nodeIdMap.get(childId));
    }
    //  返回根节点
    return root;
};
exports.buildTree = buildTree;
