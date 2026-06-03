import { Composite, Node, NodeData, ParentNode } from "../node/index";
import { nodeClsMap } from "./decorator";
import { buildTree, postOrder } from "./utils";

/***
 * 主要用来解析json文件生成行为树对象
 */
export class BehaviorSource {
  rootNode: Node | null = null;

  parse(content: any = {}) {

    try {
      // root节点已存在，代表已经成功解析过
      if(this.rootNode){
        return
      }
      const nodes = content.nodes;
      if (!nodes?.length) {
        throw new Error("节点数据不存在");
      }
      const nodesMap: Map<string, NodeData> = new Map();
      for (const node of nodes) {
        nodesMap.set(node.id, node);
      }

      /***
       *  建树（数据层面）
       */
      const root = buildTree(nodes);
      if (!root) {
        throw new Error("根节点不存在");
      }
      /***
       *  建树（对象层面）
       */
      const postOrderNodes = postOrder(root);
      // 节点id和对象的映射
      const nodeIdInstanceMap = new Map();
      // 倒序遍历
      for (let i = 0; i < postOrderNodes.length; i++) {
        const node = postOrderNodes[i];
        // 获取节点对应的class
        const cls = nodeClsMap.get(node.type) as any;
        if (!cls) {
          throw new Error("节点class不存在");
        }
        // 实例化
        const instance = new cls() as Node;
        const nodeData = nodesMap.get(node.id)!;
        // 保存node data
        instance.data = nodeData;
        // composite设置设置abortType
        if (instance instanceof Composite) {
          instance.abortType = nodeData.abortType;
        }
        // 父节点
        if (node.children?.length) {
          // 倒序遍历可以保证子节点的初始化在父节点之前
          const children = node.children.map((child) => nodeIdInstanceMap.get(child.id));
          (instance as ParentNode).setChildren(children);
        }
        nodeIdInstanceMap.set(node.id, instance);
        // 最后一项是根节点
        if (i === postOrderNodes.length - 1) {
          this.rootNode = instance;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
