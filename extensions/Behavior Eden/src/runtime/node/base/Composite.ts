import { AbortType } from "../enum";
import { ParentNode } from "./ParentNode";

export abstract class Composite extends ParentNode {
  abortType: AbortType = AbortType.None;
}
