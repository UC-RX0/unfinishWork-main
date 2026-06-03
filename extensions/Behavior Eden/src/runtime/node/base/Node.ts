import { AbortType, NodeStatus } from "../enum";

export abstract class Node {
  // 从json文件得到的节点数据
  data: NodeData = {} as NodeData;

  private _status = NodeStatus.Inactive;

  get status() {
    return this._status;
  }

  set status(newStatus) {
    this._status = newStatus;
  }

  onStart() {
    this.status = NodeStatus.Running;
  }

  onUpdate() {
    return NodeStatus.Failure;
  }

  onEnd() {
    this.status = NodeStatus.Inactive;
  }
}

export type NodeData = {
  id: string;
  type: string;
  abortType: AbortType;
  isRoot: boolean;
  children: Array<string>;
  event: {
    onStart: {
      node: string;
      comp: string;
      method: string;
      data: string;
    };
    onUpdate: {
      node: string;
      comp: string;
      method: string;
      data: string;
    };
    onEnd: {
      node: string;
      comp: string;
      method: string;
      data: string;
    };
  };
};
