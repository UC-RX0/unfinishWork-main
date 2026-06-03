import { Decorator, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("Inverter")
export class Inverter extends Decorator {
  canExecute(): boolean {
    return this.status === NodeStatus.Inactive || this.status === NodeStatus.Running;
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    this.status = status;
  }

  decorate(status: NodeStatus) {
    switch (status) {
      case NodeStatus.Success:
        return NodeStatus.Failure;
      case NodeStatus.Failure:
        return NodeStatus.Success;
      default:
        return status;
    }
  }
}
