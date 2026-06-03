"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortType = exports.NodeStatus = void 0;
var NodeStatus;
(function (NodeStatus) {
    NodeStatus[NodeStatus["Inactive"] = 0] = "Inactive";
    NodeStatus[NodeStatus["Running"] = 1] = "Running";
    NodeStatus[NodeStatus["Success"] = 2] = "Success";
    NodeStatus[NodeStatus["Failure"] = 3] = "Failure";
})(NodeStatus = exports.NodeStatus || (exports.NodeStatus = {}));
var AbortType;
(function (AbortType) {
    AbortType[AbortType["None"] = 0] = "None";
    AbortType[AbortType["LowerPriority"] = 1] = "LowerPriority";
    AbortType[AbortType["Self"] = 2] = "Self";
    AbortType[AbortType["Both"] = 3] = "Both";
})(AbortType = exports.AbortType || (exports.AbortType = {}));
