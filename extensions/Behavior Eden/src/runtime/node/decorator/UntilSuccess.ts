import { Decorator, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("UntilSuccess")
export class UntilSuccess extends Decorator {
  canExecute(): boolean {
    return this.status == NodeStatus.Inactive || this.status == NodeStatus.Failure;
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    this.status = status
  }
}
