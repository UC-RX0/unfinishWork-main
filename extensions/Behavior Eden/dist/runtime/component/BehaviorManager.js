"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorManager = void 0;
// @ts-ignore
const cc_1 = require("cc");
const Composite_1 = require("../base/Composite");
const Condition_1 = require("../base/Condition");
const ParentNode_1 = require("../base/ParentNode");
const enum_1 = require("../core/enum");
const BehaviorTree_1 = require("../core/BehaviorTree");
const { ccclass } = cc_1._decorator;
/***
 * 该组件会自动添加到场景上，用来驱动、管理场景中所有行为树
 */
let BehaviorManager = class BehaviorManager extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.behaviorTrees = [];
        // behavior是用户使用的组件，BehaviorTree是真正的行为树数据结构
        this.behaviorTreesMap = new Map();
        // 存储被暂停运行的行为树
        this.pausedBehaviorTreesMap = new Map();
    }
    restart(behaviorTree) {
        if (behaviorTree.behavior.logNodeChange) {
            console.log("restart重启行为树");
        }
        this.removeChildConditionalReevaluate(behaviorTree, -1);
        this.pushNode(behaviorTree, 0, 0);
    }
    /***
     * 不传isPause的话，默认删掉行为树
     */
    disableBehavior(behavior, isPause = false) {
        const behaviorTree = this.behaviorTreesMap.get(behavior);
        if (!behaviorTree) {
            return;
        }
        const index = this.behaviorTrees.findIndex((tree) => tree === behaviorTree);
        // 数组删除该树，停止运行
        index > -1 && this.behaviorTrees.splice(index, 1);
        if (isPause) {
            // 存进暂停map里
            this.pausedBehaviorTreesMap.set(behavior, behaviorTree);
        }
        else {
            this.behaviorTreesMap.delete(behavior);
        }
    }
    enableBehavior(behavior) {
        behavior.parse();
        const rootNode = behavior.behaviorSource.rootNode;
        if (!rootNode) {
            if (behavior.logNodeChange) {
                console.warn("该行为树没有根节点");
            }
            return;
        }
        // 仅被暂停的树，从map里拿出来继续运行
        if (this.pausedBehaviorTreesMap.has(behavior)) {
            const behaviorTree = this.pausedBehaviorTreesMap.get(behavior);
            this.pausedBehaviorTreesMap.delete(behavior);
            this.behaviorTrees.push(behaviorTree);
            this.behaviorTreesMap.set(behavior, behaviorTree);
            return;
        }
        // 全新的树
        const behaviorTree = new BehaviorTree_1.BehaviorTree();
        behaviorTree.behavior = behavior;
        this.behaviorTrees.push(behaviorTree);
        this.behaviorTreesMap.set(behavior, behaviorTree);
        behaviorTree.activeStack.push([]);
        behaviorTree.parentIndex.push(-1);
        behaviorTree.relativeChildIndex.push(-1);
        behaviorTree.parentCompositeIndex.push(-1);
        this.addToNodeList(behaviorTree, rootNode, { parentCompositeIndex: -1 });
        this.pushNode(behaviorTree, 0, 0);
    }
    addToNodeList(behaviorTree, node, data) {
        behaviorTree.nodeList.push(node);
        const index = behaviorTree.nodeList.length - 1;
        if (node instanceof ParentNode_1.ParentNode) {
            behaviorTree.childrenIndex.push([]);
            behaviorTree.childConditionalIndex.push([]);
            for (let i = 0; i < node.children.length; i++) {
                behaviorTree.parentIndex.push(index);
                behaviorTree.relativeChildIndex.push(i);
                behaviorTree.childrenIndex[index].push(behaviorTree.nodeList.length);
                if (node instanceof Composite_1.Composite) {
                    data.parentCompositeIndex = index;
                }
                behaviorTree.parentCompositeIndex.push(data.parentCompositeIndex);
                this.addToNodeList(behaviorTree, node.children[i], data);
            }
        }
        else {
            behaviorTree.childrenIndex.push(null);
            behaviorTree.childConditionalIndex.push(null);
            if (node instanceof Condition_1.Condition) {
                const parentCompositeIndex = behaviorTree.parentCompositeIndex[index];
                if (parentCompositeIndex !== -1) {
                    behaviorTree.childConditionalIndex[parentCompositeIndex].push(index);
                }
            }
        }
    }
    update() {
        this.tick();
    }
    tick() {
        // this.reevaluateConditionalNode()
        for (const behaviorTree of this.behaviorTrees) {
            for (let i = behaviorTree.activeStack.length - 1; i >= 0; i--) {
                const stack = behaviorTree.activeStack[i];
                let prevNodeIndex = -1;
                let prevStatus = enum_1.NodeStatus.Inactive;
                while (prevStatus !== enum_1.NodeStatus.Running && i < behaviorTree.activeStack.length && stack.length) {
                    const curNodeIndex = stack[stack.length - 1];
                    // console.log("prevStatus", prevStatus, "curNodeIndex", curNodeIndex);
                    if (curNodeIndex === prevNodeIndex) {
                        break;
                    }
                    prevNodeIndex = curNodeIndex;
                    prevStatus = this.runNode(behaviorTree, curNodeIndex, i, prevStatus);
                }
            }
        }
    }
    runNode(behaviorTree, index, stackIndex, prevStatus) {
        this.pushNode(behaviorTree, index, stackIndex);
        const node = behaviorTree.nodeList[index];
        let status = prevStatus;
        if (node instanceof ParentNode_1.ParentNode) {
            status = this.runParentNode(behaviorTree, index, stackIndex, status);
            if (node.canRunParallelChildren()) {
                status = node.status;
            }
        }
        else {
            status = node.onUpdate();
        }
        if (status !== enum_1.NodeStatus.Running) {
            status = this.popNode(behaviorTree, index, stackIndex, status);
        }
        return status;
    }
    runParentNode(behaviorTree, index, stackIndex, status) {
        const node = behaviorTree.nodeList[index];
        if (!node.canRunParallelChildren() || node.status !== enum_1.NodeStatus.Running) {
            let childStatus = enum_1.NodeStatus.Inactive;
            let preIndex = -1;
            while (node.canExecute() && childStatus !== enum_1.NodeStatus.Running) {
                const childIndex = node.index;
                let curIndex = childIndex;
                if (curIndex === preIndex) {
                    status = enum_1.NodeStatus.Running;
                    break;
                }
                preIndex = curIndex;
                childStatus = status = this.runNode(behaviorTree, behaviorTree.childrenIndex[index][childIndex], stackIndex, status);
            }
        }
        return status;
    }
    pushNode(behaviorTree, index, stackIndex) {
        const stack = behaviorTree.activeStack[stackIndex];
        if (stack.length === 0 || stack[stack.length - 1] !== index) {
            stack.push(index);
            const node = behaviorTree.nodeList[index];
            if (behaviorTree.behavior.logNodeChange) {
                console.log("pushNode", node);
            }
            node.onStart();
        }
    }
    popNode(behaviorTree, index, stackIndex, status, popChildren = true) {
        const stack = behaviorTree.activeStack[stackIndex];
        stack.pop();
        const node = behaviorTree.nodeList[index];
        node.onEnd();
        if (behaviorTree.behavior.logNodeChange) {
            console.log("popNode", node);
        }
        const parentIndex = behaviorTree.parentIndex[index];
        if (parentIndex !== -1) {
            if (node instanceof Condition_1.Condition) {
                const parentCompositeIndex = behaviorTree.parentCompositeIndex[index];
                if (parentCompositeIndex !== -1) {
                    const composite = behaviorTree.nodeList[parentCompositeIndex];
                    //自己是条件节点并且父级的中断类型存在，创建重判断实例
                    if (composite.abortType !== enum_1.AbortType.None) {
                        if (behaviorTree.conditionalReevaluateMap.has(index)) {
                            const conditionalReevaluate = behaviorTree.conditionalReevaluateMap.get(index);
                            // @ts-ignore
                            conditionalReevaluate.compositeIndex = -1;
                            // @ts-ignore
                            conditionalReevaluate.status = status;
                        }
                        else {
                            const conditionalReevaluate = new BehaviorTree_1.ConditionalReevaluate(index, stackIndex, status, composite.abortType === enum_1.AbortType.LowerPriority ? -1 : parentCompositeIndex);
                            behaviorTree.conditionalReevaluate.push(conditionalReevaluate);
                            behaviorTree.conditionalReevaluateMap.set(index, conditionalReevaluate);
                        }
                    }
                }
            }
            const parentNode = behaviorTree.nodeList[parentIndex];
            if (node instanceof ParentNode_1.ParentNode) {
                status = node.decorate(status);
            }
            parentNode.onChildExecuted(status, behaviorTree.relativeChildIndex[index]);
        }
        if (node instanceof Composite_1.Composite) {
            //类型是Self或者自己是None，但是子Composite是LowPriority，结束的时候清空所有中断
            if (node.abortType === enum_1.AbortType.Self || node.abortType === enum_1.AbortType.None || !stack.length) {
                this.removeChildConditionalReevaluate(behaviorTree, index);
            }
            else if (node.abortType === enum_1.AbortType.LowerPriority || node.abortType === enum_1.AbortType.Both) {
                //自己是有中断类型的组合节点，把直接孩子使用权交给自己的父级
                for (let i = 0; i < behaviorTree.childConditionalIndex[index].length; i++) {
                    const childConditionalIndex = behaviorTree.childConditionalIndex[index][i];
                    if (behaviorTree.conditionalReevaluateMap.has(childConditionalIndex)) {
                        const conditionalReevaluate = behaviorTree.conditionalReevaluateMap.get(childConditionalIndex);
                        // @ts-ignore
                        conditionalReevaluate.compositeIndex = this.parentCompositeIndex[index];
                    }
                }
                //所有重条件使用权是自己的话，交给自己的父级
                for (let i = 0; i < behaviorTree.conditionalReevaluate.length; i++) {
                    const conditionalReevaluate = behaviorTree.conditionalReevaluate[i];
                    if (conditionalReevaluate.compositeIndex === index) {
                        conditionalReevaluate.compositeIndex = behaviorTree.parentCompositeIndex[index];
                    }
                }
            }
        }
        if (popChildren) {
            //并行节点删除其他正在运行的子节点
            for (let i = behaviorTree.activeStack.length - 1; i > stackIndex; i--) {
                const stack = behaviorTree.activeStack[i];
                if (stack.length > 0 && this.isParentNode(behaviorTree, index, stack[stack.length - 1])) {
                    for (let j = stack.length - 1; j >= 0; j--) {
                        this.popNode(behaviorTree, stack[stack.length - 1], i, enum_1.NodeStatus.Failure, false);
                    }
                }
            }
        }
        if (stack.length === 0) {
            if (stackIndex === 0) {
                if (behaviorTree.behavior.restartWhenComplete) {
                    this.restart(behaviorTree);
                }
            }
            else {
                behaviorTree.activeStack.splice(stackIndex, 1);
            }
        }
        return status;
    }
    reevaluateConditionalNode(behaviorTree) {
        for (let i = behaviorTree.conditionalReevaluate.length - 1; i >= 0; i--) {
            const { index, compositeIndex, status: prevStatus } = behaviorTree.conditionalReevaluate[i];
            //爸爸组合节点索引不存在
            if (compositeIndex === -1) {
                continue;
            }
            const node = behaviorTree.nodeList[index];
            const status = node.onUpdate();
            //条件一致
            if (status === prevStatus) {
                continue;
            }
            for (let j = behaviorTree.activeStack.length - 1; j >= 0; j--) {
                const stack = behaviorTree.activeStack[j];
                if (!stack.length) {
                    continue;
                }
                let curNodeIndex = stack[stack.length - 1];
                const commonParentIndex = this.findCommonParentIndex(behaviorTree, curNodeIndex, index);
                //当前节点及他到公共父节点之类所有父节点pop出去
                if (this.isParentNode(behaviorTree, compositeIndex, commonParentIndex)) {
                    const stackLen = behaviorTree.activeStack.length;
                    while (curNodeIndex !== -1 &&
                        curNodeIndex !== commonParentIndex &&
                        behaviorTree.activeStack.length === stackLen) {
                        this.popNode(behaviorTree, curNodeIndex, j, enum_1.NodeStatus.Failure, false);
                        curNodeIndex = behaviorTree.parentIndex[curNodeIndex];
                    }
                }
            }
            //右边的包括自己的重评估条件删除掉
            for (let j = behaviorTree.conditionalReevaluate.length - 1; j >= i; j--) {
                const conditionalReevaluate = behaviorTree.conditionalReevaluate[j];
                if (this.isParentNode(behaviorTree, compositeIndex, conditionalReevaluate.index)) {
                    behaviorTree.conditionalReevaluateMap.delete(conditionalReevaluate.index);
                    behaviorTree.conditionalReevaluate.splice(j, 1);
                }
            }
            //同一低优先级中断父级下的左边元素都不执行了
            const compositeNode = behaviorTree.nodeList[behaviorTree.parentCompositeIndex[index]];
            for (let j = i - 1; j >= 0; j--) {
                const conditionalReevaluate = behaviorTree.conditionalReevaluate[j];
                if (behaviorTree.parentCompositeIndex[conditionalReevaluate.index] === behaviorTree.parentCompositeIndex[index]) {
                    if (compositeNode.abortType === enum_1.AbortType.LowerPriority) {
                        conditionalReevaluate.compositeIndex = -1;
                        // this.conditionalReevaluateMap.delete(conditionalReevaluate.index)
                        // this.conditionalReevaluate.splice(j, 1)
                        // i--;
                    }
                    else {
                        // for (let k = 0; k < this.childrenIndex[compositeIndex].length; k++) {
                        //   let num4 = this.childrenIndex[compositeIndex][k]
                        //   if (this.isParentNode(num4, conditionalReevaluate.index)) {
                        //     while (this.nodeList[num4] instanceof Decorator) {
                        //       num4 = this.childrenIndex[num4][0];
                        //     }
                        //     if (this.nodeList[num4] instanceof Composite) {
                        //       conditionalReevaluate.compositeIndex = num4;
                        //     }
                        //     break;
                        //   }
                        // }
                    }
                }
            }
            //中断节点以上到组合节点执行onConditionalAbort
            const conditionalParentIndex = [];
            for (let m = behaviorTree.parentIndex[index]; m != compositeIndex; m = behaviorTree.parentIndex[m]) {
                conditionalParentIndex.push(m);
            }
            conditionalParentIndex.push(compositeIndex);
            for (let n = conditionalParentIndex.length - 1; n >= 0; n--) {
                const parentTask = behaviorTree.nodeList[conditionalParentIndex[n]];
                if (n === 0) {
                    parentTask.onConditionalAbort(behaviorTree.relativeChildIndex[index]);
                }
                else {
                    parentTask.onConditionalAbort(behaviorTree.relativeChildIndex[conditionalParentIndex[n - 1]]);
                }
            }
        }
    }
    removeChildConditionalReevaluate(behaviorTree, compositeIndex) {
        for (let i = behaviorTree.conditionalReevaluate.length - 1; i >= 0; i--) {
            if (behaviorTree.conditionalReevaluate[i].compositeIndex === compositeIndex) {
                behaviorTree.conditionalReevaluateMap.delete(behaviorTree.conditionalReevaluate[i].index);
                behaviorTree.conditionalReevaluate.splice(i, 1);
            }
        }
    }
    findCommonParentIndex(behaviorTree, index1, index2) {
        const set = new Set();
        let num = index1;
        while (num !== -1) {
            set.add(num);
            num = behaviorTree.parentIndex[num];
        }
        num = index2;
        while (!set.has(num)) {
            num = behaviorTree.parentIndex[num];
        }
        return num;
    }
    isParentNode(behaviorTree, possibleParent, possibleChild) {
        for (let num = possibleChild; num !== -1; num = behaviorTree.parentIndex[num]) {
            if (num === possibleParent) {
                return true;
            }
        }
        return false;
    }
};
BehaviorManager.instance = null;
BehaviorManager = __decorate([
    ccclass("BehaviorManager")
], BehaviorManager);
exports.BehaviorManager = BehaviorManager;
