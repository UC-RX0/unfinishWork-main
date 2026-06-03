import { _decorator, Component, director } from "cc";
import { AbortType, Composite, Condition, Decorator, Node, NodeData, NodeStatus, ParentNode } from "../node";
import { BehaviorTree as Behavior, BehaviorTreeEvent } from "./BehaviorTree";
import { bfsCcNode } from "./utils";

const { ccclass } = _decorator;

/***
 * 该组件会自动添加到场景上，用来驱动、管理场景中所有行为树
 */
@ccclass("BehaviorManager")
export class BehaviorManager extends Component {
  static instance: BehaviorManager | null = null;

  behaviorTrees: BehaviorTree[] = [];
  // behavior是用户使用的组件，BehaviorTree是真正的行为树数据结构
  behaviorTreesMap: Map<Behavior, BehaviorTree> = new Map();
  // 存储被暂停运行的行为树
  pausedBehaviorTreesMap: Map<Behavior, BehaviorTree> = new Map();

  restart(behaviorTree: BehaviorTree) {
    if (behaviorTree.behavior.logNodeChange) {
      console.log("restart", behaviorTree);
    }
    // 所有节点都popNode出去以后，未删除的条件重评估的compositeIndex都为-1
    this.removeChildConditionalReevaluate(behaviorTree, -1);
    this.pushNode(behaviorTree, 0, 0);
  }

  // 防止用户手动创建实例但没有设置instance
  onLoad() {
    BehaviorManager.instance = this;
  }

  onDestroy() {
    for (const behaviorTree of this.behaviorTrees) {
      this.disableBehavior(behaviorTree.behavior);
    }
  }

  /***
   * 不传isPause的话，默认删掉行为树
   */
  disableBehavior(behavior: Behavior, isPause = false) {
    const behaviorTree = this.behaviorTreesMap.get(behavior);
    if (!behaviorTree) {
      return;
    }

    if (isPause) {
      // 存进暂停map里
      this.pausedBehaviorTreesMap.set(behavior, behaviorTree);
      behaviorTree.behavior.status = NodeStatus.Inactive; //设置为未激活状态
    } else {
      // 如果是手动disabled的话，让剩下的节点popNode，并不断迭代这个状态作为最终行为树的状态
      let status = NodeStatus.Success;
      for (let i = behaviorTree.activeStack.length - 1; i >= 0; i--) {
        const curStack = behaviorTree.activeStack[i];
        for (let j = curStack.length - 1; j >= 0; j--) {
          status = this.popNode(behaviorTree, curStack[curStack.length - 1], i, status, false);
        }
      }
      behavior.status = status;
      this.removeChildConditionalReevaluate(behaviorTree, -1);
      behavior.emit(BehaviorTreeEvent.BehaviorTreeEnd);
      this.behaviorTreesMap.delete(behavior);
    }
    const index = this.behaviorTrees.findIndex((tree) => tree === behaviorTree);
    // 数组删除该树
    index > -1 && this.behaviorTrees.splice(index, 1);
  }

  public enableBehavior(behavior: Behavior) {
    const rootNode = behavior.behaviorSource.rootNode;
    if (!rootNode) {
      if (behavior.logNodeChange) {
        console.warn("该行为树没有根节点");
      }
      return;
    }

    // 仅被暂停的树，从map里拿出来继续运行
    if (this.pausedBehaviorTreesMap.has(behavior)) {
      const behaviorTree = this.pausedBehaviorTreesMap.get(behavior)!;
      this.pausedBehaviorTreesMap.delete(behavior);
      this.behaviorTrees.push(behaviorTree);
      this.behaviorTreesMap.set(behavior, behaviorTree);
      return;
    }

    // 全新的树
    const behaviorTree = new BehaviorTree();
    behaviorTree.behavior = behavior;
    this.behaviorTrees.push(behaviorTree);
    this.behaviorTreesMap.set(behavior, behaviorTree);
    //填充数据结构
    behaviorTree.activeStack.push([]);
    behaviorTree.parentIndex.push(-1);
    behaviorTree.relativeChildIndex.push(-1);
    behaviorTree.parentCompositeIndex.push(-1);
    this.addToNodeList(behaviorTree, rootNode, { parentCompositeIndex: -1 });
    //根节点放入运行栈
    behaviorTree.behavior.emit(BehaviorTreeEvent.BehaviorTreeStart);
    behaviorTree.behavior.status = NodeStatus.Running;
    //根节点放入运行栈
    this.pushNode(behaviorTree, 0, 0);
  }

  // 数据结构填充
  addToNodeList(behaviorTree: BehaviorTree, node: Node, data: { parentCompositeIndex: number }) {
    behaviorTree.nodeList.push(node);
    const index = behaviorTree.nodeList.length - 1;
    if (node instanceof ParentNode) {
      behaviorTree.childrenIndex.push([]);
      behaviorTree.childConditionalIndex.push([]);
      for (let i = 0; i < node.children.length; i++) {
        behaviorTree.parentIndex.push(index);
        behaviorTree.relativeChildIndex.push(i);
        behaviorTree.childrenIndex[index].push(behaviorTree.nodeList.length);
        if (node instanceof Composite) {
          data.parentCompositeIndex = index;
        }
        behaviorTree.parentCompositeIndex.push(data.parentCompositeIndex);
        this.addToNodeList(behaviorTree, node.children[i], data);
      }
    } else {
      behaviorTree.childrenIndex.push(null as any);
      behaviorTree.childConditionalIndex.push(null as any);
      if (node instanceof Condition) {
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

  /***
   * 驱动所有行为树
   */
  tick() {
    //遍历所有树
    for (const behaviorTree of this.behaviorTrees) {
      if (behaviorTree.behavior.logNodeChange) {
        console.log("tick", behaviorTree);
      }
      // 重评估条件
      this.reevaluateConditionalNode(behaviorTree);
      //遍历所有运行栈
      //
      for (let i = behaviorTree.activeStack.length - 1; i >= 0; i--) {
        const curStack = behaviorTree.activeStack[i];
        let prevIndex = -1;
        let prevStatus = NodeStatus.Inactive;

        while (prevStatus !== NodeStatus.Running && i < behaviorTree.activeStack.length && curStack.length) {
          const curIndex = curStack[curStack.length - 1];
          // 记录前后两次，防止repeater子节点状态为success时，在一个tick里重复运行
          if (curIndex === prevIndex) {
            break;
          }
          prevIndex = curIndex;
          // runNode需要传入prevStatus的原因是
          // 例如selector一个子节点是running状态，某个tick变成了success状态，子节点popNode出去
          // 下一个tick进来，栈顶元素是selector，此时canExecute为false，runParentNode没办法返回一个具体的状态
          // 此时就可以把上一个tick子节点的状态作为本次tick的selector的状态（反转节点同理）
          prevStatus = this.runNode(behaviorTree, curIndex, i, prevStatus);
        }
      }
    }
  }

  runNode(behaviorTree: BehaviorTree, index: number, stackIndex: number, prevStatus: NodeStatus) {
    const node = behaviorTree.nodeList[index];
    // 保证运行的节点在栈顶
    this.pushNode(behaviorTree, index, stackIndex);
    let status = prevStatus;
    if (node instanceof ParentNode) {
      status = this.runParentNode(behaviorTree, index, stackIndex, status);
      // 并行节点的状态不由某个子节点状态决定，而是由多个共同决定，所以重新计算status
      status = node.overrideStatus(status);
    } else {
      // 执行目标事件
      const res1 = node.onUpdate();
      const [done, res2] = this.emitEvent(behaviorTree, node.data, "onUpdate");
      status = done ? res2 : res1;
    }

    // 非running的节点pop出去
    if (status !== NodeStatus.Running) {
      status = this.popNode(behaviorTree, index, stackIndex, status);
    }

    return status;
  }

  runParentNode(behaviorTree: BehaviorTree, index: number, stackIndex: number, status: NodeStatus) {
    const node = behaviorTree.nodeList[index] as ParentNode;
    //防止running状态的并行节点重复运行
    if (node.canRunParallelChildren() && node.overrideStatus(NodeStatus.Running) === NodeStatus.Running) {
      return status;
    }

    let childStatus = NodeStatus.Inactive;
    let preIndex = -1;
    //并行节点可以存在多个running状态的子节点
    while (node.canExecute() && (childStatus !== NodeStatus.Running || node.canRunParallelChildren())) {
      const childIndex = node.index;
      // 并行节点创建新的运行栈
      if (node.canRunParallelChildren()) {
        behaviorTree.activeStack.push([]);
        stackIndex = behaviorTree.activeStack.length - 1;
        node.onChildStarted();
      }

      let curIndex = childIndex;
      // 防止repeater或untilSuccess等可以重复运行的节点，canExecute一直是true，会导致一直进入while
      // 所以加入curIndex和preIndex，保证不能在一次runParentNode里重复运行相同节点
      if (curIndex === preIndex) {
        status = NodeStatus.Running;
        break;
      }
      preIndex = curIndex;
      status = childStatus = this.runNode(
        behaviorTree,
        behaviorTree.childrenIndex[index][childIndex],
        stackIndex,
        status
      );
    }

    // 子节点有运行就返回子节点的状态，没有就返回上一次运行的状态
    return status;
  }

  pushNode(behaviorTree: BehaviorTree, index: number, stackIndex: number) {
    const stack = behaviorTree.activeStack[stackIndex];
    // 防止重复推入
    if (stack.length === 0 || stack[stack.length - 1] !== index) {
      stack.push(index);
      const node = behaviorTree.nodeList[index];
      if (behaviorTree.behavior.logNodeChange) {
        console.log("pushNode", node, "index:", index, "stackIndex:", stackIndex);
      }
      node.onStart();
      this.emitEvent(behaviorTree, node.data, "onStart");
    }
  }

  popNode(behaviorTree: BehaviorTree, index: number, stackIndex: number, status: NodeStatus, popChildren = true) {
    const curStack = behaviorTree.activeStack[stackIndex];
    curStack.pop();
    const node = behaviorTree.nodeList[index];
    node.onEnd();
    this.emitEvent(behaviorTree, node.data, "onEnd");
    if (behaviorTree.behavior.logNodeChange) {
      console.log("popNode", node, "index:", index, "stackIndex:", stackIndex, "status:", status);
    }
    const parentIndex = behaviorTree.parentIndex[index];
    if (parentIndex !== -1) {
      if (node instanceof Condition) {
        const parentCompositeIndex = behaviorTree.parentCompositeIndex[index];
        if (parentCompositeIndex !== -1) {
          const composite = behaviorTree.nodeList[parentCompositeIndex] as Composite;
          //自己是条件节点并且父级的中断类型存在，创建重判断实例
          if (composite.abortType !== AbortType.None) {
            // 父composite为LowerPriority时，条件重评估不希望此时执行，而是父composite popNode出去再执行
            const compositeIndex = composite.abortType === AbortType.LowerPriority ? -1 : parentCompositeIndex;
            // 防止该条件存在条件重评估对象
            if (behaviorTree.conditionalReevaluateMap.has(index)) {
              const conditionalReevaluate = behaviorTree.conditionalReevaluateMap.get(index)!;
              conditionalReevaluate.compositeIndex = compositeIndex;
              conditionalReevaluate.status = status;
            } else {
              const conditionalReevaluate = new ConditionalReevaluate(index, stackIndex, status, compositeIndex);
              if (behaviorTree.behavior.logNodeChange) {
                console.log(
                  "new ConditionalReevaluate",
                  conditionalReevaluate,
                  "index:",
                  index,
                  "stackIndex:",
                  stackIndex,
                  "compositeIndex",
                  compositeIndex
                );
              }
              behaviorTree.conditionalReevaluate.push(conditionalReevaluate);
              behaviorTree.conditionalReevaluateMap.set(index, conditionalReevaluate);
            }
          }
        }
      }

      const parentNode = behaviorTree.nodeList[parentIndex] as ParentNode;
      parentNode.onChildExecuted(status, behaviorTree.relativeChildIndex[index]);
      // 父节点是反转节点，修改结果
      if (parentNode instanceof Decorator) {
        status = parentNode.decorate(status);
      }
    }

    if (node instanceof Composite) {
      // 类型是Self或者None时，清空所有子条件重评估，或者popNode的节点是当前运行栈的最后一项，删除该节点管理的条件重评估
      if ([AbortType.Self, AbortType.None].includes(node.abortType) || !curStack.length) {
        this.removeChildConditionalReevaluate(behaviorTree, index);
        // 类型是LowerPriority或者Both，上移compositeIndex，compositeIndex为-1的条件重评估对象，LowerPriority，会因此激活
      } else if ([AbortType.LowerPriority, AbortType.Both].includes(node.abortType)) {
        for (let i = 0; i < behaviorTree.childConditionalIndex[index].length; i++) {
          const childConditionalIndex = behaviorTree.childConditionalIndex[index][i];
          if (behaviorTree.conditionalReevaluateMap.has(childConditionalIndex)) {
            const conditionalReevaluate = behaviorTree.conditionalReevaluateMap.get(childConditionalIndex)!;
            conditionalReevaluate.compositeIndex = behaviorTree.parentCompositeIndex[index];
          }
        }

        // 上移当前被移除的composite管理的所有条件重评估的compositeIndex
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
          let status = NodeStatus.Failure;
          for (let j = stack.length - 1; j >= 0; j--) {
            status = this.popNode(behaviorTree, stack[stack.length - 1], i, status, false);
          }
        }
      }
    }

    // 当前运行栈没有节点了
    if (curStack.length === 0) {
      // 当前运行栈就是主运行栈
      if (stackIndex === 0) {
        // 重启行为树
        if (behaviorTree.behavior.restartWhenComplete) {
          this.restart(behaviorTree);
        } else {
          this.disableBehavior(behaviorTree.behavior);
          //修改disableBehavior写入的status
          behaviorTree.behavior.status = status;
        }
        status = NodeStatus.Inactive;
      } else {
        // 删除其他空子运行栈
        behaviorTree.activeStack.splice(stackIndex, 1);
        // 返回running，退出tick的while循环
        status = NodeStatus.Running;
      }
    }

    return status;
  }

  reevaluateConditionalNode(behaviorTree: BehaviorTree) {
    if (behaviorTree.behavior.logNodeChange) {
      console.log("reevaluateConditionalNode start", behaviorTree.conditionalReevaluate);
    }
    for (let i = behaviorTree.conditionalReevaluate.length - 1; i >= 0; i--) {
      const { index, compositeIndex, status: prevStatus } = behaviorTree.conditionalReevaluate[i];
      //父组合节点索引不存在或者故意设置为-1，不进行评估
      if (compositeIndex === -1) {
        continue;
      }

      const node = behaviorTree.nodeList[index];
      let status = NodeStatus.Inactive;
      const res1 = node.onUpdate();
      const [done, res2] = this.emitEvent(behaviorTree, node.data, "onUpdate");
      status = done ? res2 : res1;

      //条件一致
      if (status === prevStatus) {
        continue;
      }

      if (behaviorTree.behavior.logNodeChange) {
        console.log("reevaluateConditionalNode success", behaviorTree.conditionalReevaluate[i]);
      }

      for (let j = behaviorTree.activeStack.length - 1; j >= 0; j--) {
        const stack = behaviorTree.activeStack[j];
        if (!stack.length) {
          continue;
        }

        //当前节点及他到公共父节点之间所有父节点pop出去
        let curNodeIndex = stack[stack.length - 1];
        const commonParentIndex = this.findCommonParentIndex(behaviorTree, curNodeIndex, index);
        // 该条件重评估的compositeIndex是commonParent的父级
        if (this.isParentNode(behaviorTree, compositeIndex, commonParentIndex)) {
          // popNode可能会修改activeStack，保存一下长度，相同才执行
          const stackLen = behaviorTree.activeStack.length;
          while (
            curNodeIndex !== -1 &&
            curNodeIndex !== commonParentIndex &&
            behaviorTree.activeStack.length === stackLen
          ) {
            this.popNode(behaviorTree, curNodeIndex, j, NodeStatus.Failure, false);
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

      const compositeNode = behaviorTree.nodeList[behaviorTree.parentCompositeIndex[index]] as Composite;
      // 遍历左侧的条件重评估对象
      for (let j = i - 1; j >= 0; j--) {
        const conditionalReevaluate = behaviorTree.conditionalReevaluate[j];
        if (
          behaviorTree.parentCompositeIndex[conditionalReevaluate.index] === behaviorTree.parentCompositeIndex[index]
        ) {
          // composite节点是LowerPriority，则让这些条件停止运行
          if (compositeNode.abortType === AbortType.LowerPriority) {
            conditionalReevaluate.compositeIndex = -1;
            // composite节点是Both或者Self，条件重评估的compositeIndex等于parentCompositeIndex
          } else if ([AbortType.Both, AbortType.Self].includes(compositeNode.abortType)) {
            conditionalReevaluate.index = behaviorTree.parentCompositeIndex[index];
          }
        }
      }

      //当前条件节点到CommonParentNode之间所有Composite节点执行onConditionalAbort
      const conditionalParentIndex = [];
      for (let m = behaviorTree.parentIndex[index]; m != compositeIndex; m = behaviorTree.parentIndex[m]) {
        conditionalParentIndex.push(m);
      }
      conditionalParentIndex.push(compositeIndex);
      //从顶部到底部的顺序执行
      for (let n = conditionalParentIndex.length - 1; n >= 0; n--) {
        const parentTask = behaviorTree.nodeList[conditionalParentIndex[n]] as ParentNode;
        if (n === 0) {
          parentTask.onConditionalAbort(behaviorTree.relativeChildIndex[index]);
        } else {
          parentTask.onConditionalAbort(behaviorTree.relativeChildIndex[conditionalParentIndex[n - 1]]);
        }
      }
    }
  }

  removeChildConditionalReevaluate(behaviorTree: BehaviorTree, compositeIndex: number) {
    for (let i = behaviorTree.conditionalReevaluate.length - 1; i >= 0; i--) {
      if (behaviorTree.conditionalReevaluate[i].compositeIndex === compositeIndex) {
        behaviorTree.conditionalReevaluateMap.delete(behaviorTree.conditionalReevaluate[i].index);
        behaviorTree.conditionalReevaluate.splice(i, 1);
      }
    }
  }

  findCommonParentIndex(behaviorTree: BehaviorTree, index1: number, index2: number) {
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

  isParentNode(behaviorTree: BehaviorTree, possibleParent: number, possibleChild: number) {
    for (let num = possibleChild; num !== -1; num = behaviorTree.parentIndex[num]) {
      if (num === possibleParent) {
        return true;
      }
    }
    return false;
  }

  /***
   * 执行节点事件
   */
  emitEvent(
    behaviorTree: BehaviorTree,
    nodeData: NodeData,
    lifeCycle: keyof NodeData["event"]
  ): [false, null] | [true, NodeStatus] {
    const dump: NodeData["event"]["onStart"] = nodeData.event[lifeCycle];
    const nodeUuid = dump.node;
    const compUuid = dump.comp;
    const methodName = dump.method;
    const methodData = dump.data;
    if (!nodeUuid || !compUuid || !methodName) {
      return [false, null];
    }

    // 行为树组件所在cocos节点
    const curNode = behaviorTree.behavior.node;
    // 先从当前节点开始层序遍历
    let target = bfsCcNode(curNode, nodeUuid);
    // 找不到再从scene节点开始层序遍历
    if (!target) {
      target = bfsCcNode(director.getScene(), nodeUuid, curNode.uuid);
    }
    if (!target) {
      return [false, null];
    }

    const comp = target._components.find((comp: any) => comp.uuid === compUuid);
    if (!comp) {
      return [false, null];
    }

    const method = comp[methodName];
    if (!method) {
      return [false, null];
    }

    const res = method.call(comp, methodData);
    // 用户忘记写返回值，一律返回失败
    const result = res !== undefined ? res : NodeStatus.Failure;
    return [true, result];
  }
}

/***
 * 行为树数据结构，具体执行逻辑由BehaviorManager驱动
 */
class BehaviorTree {
  // @ts-ignore
  root: BTTree;
  // @ts-ignore
  behavior: Behavior; //用户使用的BehaviorTree组件
  activeStack: Array<Array<number>> = [];
  nodeList: Array<Node> = [];
  //当前节点的父节点
  parentIndex: Array<number> = [];
  //当前节点的子节点
  childrenIndex: Array<Array<number>> = [];

  /***
   * 为了实现中断
   */
  //当前节点是父节点的第几个子节点
  relativeChildIndex: Array<number> = [];
  //当前节点的父组合节点
  parentCompositeIndex: Array<number> = [];
  //当前节点的子条件节点
  childConditionalIndex: Array<Array<number>> = [];
  //所有条件重评估
  conditionalReevaluate: Array<ConditionalReevaluate> = [];
  //条件重评估id的map
  conditionalReevaluateMap: Map<number, ConditionalReevaluate> = new Map();
}

/***
 * 条件重评估数据结构
 * 各种情况讲解：
 * 1、LowerPriority：左侧的重评估条件可以打断右侧Action节点的运行，不过不是所有都能打断，当Action属于该compositeIndex所管理的子树才能打断
 *  因此，随着compositeIndex逐渐上移，该条件能打断的范围就会越大，当然这就需要此条件的父节点均有LowerPriority或者Both，才能让compositeIndex一直上移
 * 2、Self：只能打断跟自己同一Composite节点下的其他节点的运行，当该Composite被popNode时，条件也会被删除
 * 3、Parallel：Parallel下有多个分支都有LowerPriority的条件重评估对象：
 *    情况1、假设某个分支返回Running状态，此时这个分支下的compositeIndex未达到并行节点，无法管理其他分支下Action运行
 *    情况2：返回Success或者Failure状态，当该运行栈最后一个元素popNode出去时，此时栈为空，会删除其管理的条件重评估
 *          如果该条件的compositeIndex是-1，不会进入compositeIndex上移逻辑，因此也无法运行
 *    总结：某个并行节点下的多个并行分支，各自的条件不会干扰
 */
class ConditionalReevaluate {
  constructor(
    public index: number,
    public stackIndex: number,
    public status: NodeStatus,
    public compositeIndex: number
  ) {}
}
