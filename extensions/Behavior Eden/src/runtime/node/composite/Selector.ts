import { Composite, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("Selector")
export default class Selector extends Composite {
  onStart(): void {
    super.onStart();
    this.index = 0;
  }

  canExecute(): boolean {
    return this.index < this.children.length && this.status !== NodeStatus.Success;
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    switch (status) {
      case NodeStatus.Success:
        this.status = NodeStatus.Success;
        break;
      case NodeStatus.Failure:
        this.index++;
        if (this.index >= this.children.length) {
          this.status = NodeStatus.Failure;
        } else {
          this.status = NodeStatus.Running;
        }
        break;
      case NodeStatus.Running:
        this.status = NodeStatus.Running;
        break;
      default:
        break;
    }
  }

  onConditionalAbort(index: number) {
    this.index = index;
    this.status = NodeStatus.Inactive;
  }
}
