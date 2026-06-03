"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorSource = void 0;
const index_1 = require("../node/index");
const decorator_1 = require("./decorator");
const utils_1 = require("./utils");
/***
 * 主要用来解析json文件生成行为树对象
 */
class BehaviorSource {
    constructor() {
        this.rootNode = null;
    }
    parse(content = {}) {
        var _a;
        try {
            // root节点已存在，代表已经成功解析过
            if (this.rootNode) {
                return;
            }
            const nodes = content.nodes;
            if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
                throw new Error("节点数据不存在");
            }
            const nodesMap = new Map();
            for (const node of nodes) {
                nodesMap.set(node.id, node);
            }
            /***
             *  建树（数据层面）
             */
            const root = (0, utils_1.buildTree)(nodes);
            if (!root) {
                throw new Error("根节点不存在");
            }
            /***
             *  建树（对象层面）
             */
            const postOrderNodes = (0, utils_1.postOrder)(root);
            // 节点id和对象的映射
            const nodeIdInstanceMap = new Map();
            // 倒序遍历
            for (let i = 0; i < postOrderNodes.length; i++) {
                const node = postOrderNodes[i];
                // 获取节点对应的class
                const cls = decorator_1.nodeClsMap.get(node.type);
                if (!cls) {
                    throw new Error("节点class不存在");
                }
                // 实例化
                const instance = new cls();
                const nodeData = nodesMap.get(node.id);
                // 保存node data
                instance.data = nodeData;
                // composite设置设置abortType
                if (instance instanceof index_1.Composite) {
                    instance.abortType = nodeData.abortType;
                }
                // 父节点
                if ((_a = node.children) === null || _a === void 0 ? void 0 : _a.length) {
                    // 倒序遍历可以保证子节点的初始化在父节点之前
                    const children = node.children.map((child) => nodeIdInstanceMap.get(child.id));
                    instance.setChildren(children);
                }
                nodeIdInstanceMap.set(node.id, instance);
                // 最后一项是根节点
                if (i === postOrderNodes.length - 1) {
                    this.rootNode = instance;
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.BehaviorSource = BehaviorSource;
