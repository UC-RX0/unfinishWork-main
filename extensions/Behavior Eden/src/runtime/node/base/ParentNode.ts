import { NodeStatus } from "../../node/enum";
import { Node } from "./Node";

export abstract class ParentNode extends Node {
  children: Array<Node> = [];
  private _index: number = 0;

  get index() {
    return this._index;
  }

  set index(data) {
    this._index = data;
  }

  constructor(children: Array<Node>) {
    super();
    this.children = children;
  }

  abstract canExecute(): boolean;

  abstract onChildExecuted(status: NodeStatus, index: number): void;

  setChildren(children: Array<Node>) {
    this.children = children;
  }

  onConditionalAbort(childIndex: number) {}

  decorate(status: NodeStatus) {
    return status;
  }

  //并行节点的状态不由某个子节点状态决定，而是由多个共同决定，所以重新计算status
  overrideStatus(status:NodeStatus){
    return status
  }

  canRunParallelChildren() {
    return false;
  }

  onChildStarted() {}


}
