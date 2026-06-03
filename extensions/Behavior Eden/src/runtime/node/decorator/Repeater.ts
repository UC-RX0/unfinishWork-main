import { Decorator, NodeStatus, Node } from "../index";
import { btclass } from "../../core/decorator";

@btclass("Repeater")
export class Repeater extends Decorator {
  private repeatCount = Infinity;
  private curCount = 0;
  private endOnFailure = true;

  /***
   * 参数未来可以通过Shared Variable，这期就不做了
   */
  // constructor(children: Array<Node>, repeatCount = Infinity, endOnFailure = false) {
  //   super(children);
  //   this.repeatCount = repeatCount;
  //   this.endOnFailure = endOnFailure;
  // }

  canExecute(): boolean {
    return (
      this.curCount < this.repeatCount &&
      (!this.endOnFailure || (this.endOnFailure && this.status !== NodeStatus.Failure))
    );
  }

  onChildExecuted(status: NodeStatus, _: number): void {
    this.curCount++;
    this.status = status;
  }

  onStart() {
    super.onStart();
    this.curCount = 0;
  }
}
