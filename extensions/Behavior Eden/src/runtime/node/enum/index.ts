export enum NodeStatus {
  Inactive,
  Running,
  Success,
  Failure,
}

export enum AbortType {
  None,
  LowerPriority,
  Self,
  Both,
}
