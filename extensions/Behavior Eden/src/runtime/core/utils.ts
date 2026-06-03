import { AbortType } from "../node";

// 树状节点形式
type NodeTree = { id: string; type: string; abortType: AbortType; isRoot: boolean; children: Array<NodeTree> };

/***
 * N叉树的倒序遍历
 */
export const postOrder = function (root: NodeTree) {
  if (!root) {
    return [];
  }

  const stack = [root];
  const stack2 = [];
  const result = [];
  while (stack.length) {
    const node = stack.pop()!;
    stack2.push(node);
    for (let i = 0; i < node.children.length; i++) {
      stack.push(node.children[i]);
    }
  }

  while (stack2.length) {
    result.push(stack2.pop()!);
  }
  return result;
};

/**
 * 数组转树，返回根节点
 * @param nodes
 * @returns root
 */
export const buildTree = (_nodes: any) => {
  // 防止修改有原数据
  const nodes = deepClone(_nodes);
  const nodeMap: Map<string, any> = new Map();

  let root: NodeTree | null = null;
  // 记录id和node数据的映射
  for (const node of nodes) {
    if (node.isRoot) {
      root = node;
    }
    nodeMap.set(node.id, node);
  }

  // 没有根节点
  if (!root) {
    return null;
  }

  // 把children中的Id换成真正的node数据
  for (const node of nodes) {
    node.children = node.children.map((childId: any) => nodeMap.get(childId)!);
  }

  //  返回根节点
  return root;
};

/***
 * BFS开始
 * 从当前节点开始层序遍历
 * 找不到再从scene节点开始层序遍历
 * dirtyNode代表需要跳过的节点，避免scene场景重复遍历curNode
 */
export const bfsCcNode = (root: any, targetUuid: string, dirtyUuid?: string) => {
  let target = null;

  let queue = [root];
  // 给while循环起名
  myWhile: while (queue.length) {
    const len = queue.length;
    for (let i = 0; i < len; i++) {
      const item = queue.pop();
      const uuid = item.uuid;
      if (uuid === targetUuid) {
        target = item;
        // 找到目标，直接退出while循环
        break myWhile;
      }
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        // 跳过已经遍历过的节点
        if (dirtyUuid && child.uuid === dirtyUuid) {
          continue;
        }
        queue.unshift(child);
      }
    }
  }

  return target;
};

export const preOrder = function (root: any) {
  if (!root) {
    return [];
  }
  var stack = [root];
  var result = [];
  while (stack.length) {
    const item = stack.pop();
    for (let i = item.children.length - 1; i >= 0; i--) {
      stack.push(item.children[i]);
    }
    result.push(item);
  }

  return result;
};

/***
 * 深克隆
 */
export const deepClone = (obj: any) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const res: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      res[key] = deepClone(obj[key]);
    }
  }

  return res;
};
