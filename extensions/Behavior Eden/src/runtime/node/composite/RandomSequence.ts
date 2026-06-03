import { Composite, NodeStatus } from "../index";
import { btclass } from "../../core/decorator";

@btclass("RandomSequence")
export default class RandomSequence extends Composite {
  executionOrder: Array<number> = [];

  get index() {
    return this.executionOrder[this.executionOrder.length - 1];
  }

  onStart(): void {
    super.onStart();
    this.shuffle();
  }

  canExecute(): boolean {
    return Boolean(this.executionOrder.length) && this.status !== NodeStatus.Failure;
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    this.executionOrder.pop();
    this.status = status;
  }

  onConditionalAbort() {
    this.executionOrder = [];
    this.status = NodeStatus.Inactive;
    this.shuffle();
  }

  shuffle() {
    this.executionOrder = [];
    const indexList = Array.from({ length: this.children.length }, (e, i) => i);
    for (let i = indexList.length - 1; i >= 0; i--) {
      const num = Math.floor(Math.random() * indexList.length);
      this.executionOrder.push(indexList.splice(num, 1)[0]);
    }
  }
}
