import { Composite, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("Sequence")
export default class Sequence extends Composite {
  onStart(): void {
    super.onStart();
    this.index = 0;
  }

  canExecute(): boolean {
    return this.index < this.children.length && this.status !== NodeStatus.Failure;
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    this.index++;
    this.status = status;
  }

  onConditionalAbort(index: number) {
    this.index = index;
    this.status = NodeStatus.Inactive;
  }
}
