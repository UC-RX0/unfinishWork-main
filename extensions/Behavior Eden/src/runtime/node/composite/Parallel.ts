import { Composite, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("Parallel")
export default class Parallel extends Composite {
  executionStatus: Array<NodeStatus> = [];

  onStart(): void {
    super.onStart();
    this.index = 0;
    this.executionStatus = this.children.map(() => NodeStatus.Inactive);
  }

  canRunParallelChildren() {
    return true;
  }

  onChildStarted() {
    this.executionStatus[this.index] = NodeStatus.Running;
    this.index++;
  }

  canExecute(): boolean {
    return this.index < this.children.length;
  }

  onChildExecuted(status: NodeStatus, index: number): void {
    this.executionStatus[index] = status;
  }

  overrideStatus(_: NodeStatus) {
    let childrenComplete = true;
    for (let i = 0; i < this.executionStatus.length; i++) {
      if (this.executionStatus[i] == NodeStatus.Running) {
        childrenComplete = false;
      } else if (this.executionStatus[i] == NodeStatus.Failure) {
        return NodeStatus.Failure;
      }
    }
    return childrenComplete ? NodeStatus.Success : NodeStatus.Running;
  }

  onConditionalAbort(childIndex: number): void {
    this.index = 0;
    this.executionStatus = this.executionStatus.map(() => NodeStatus.Inactive);
  }
}
