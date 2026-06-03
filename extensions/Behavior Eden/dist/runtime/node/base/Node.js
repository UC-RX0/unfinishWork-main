"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const enum_1 = require("../enum");
class Node {
    constructor() {
        // 从json文件得到的节点数据
        this.data = {};
        this._status = enum_1.NodeStatus.Inactive;
    }
    get status() {
        return this._status;
    }
    set status(newStatus) {
        this._status = newStatus;
    }
    onStart() {
        this.status = enum_1.NodeStatus.Running;
    }
    onUpdate() {
        return enum_1.NodeStatus.Failure;
    }
    onEnd() {
        this.status = enum_1.NodeStatus.Inactive;
    }
}
exports.Node = Node;
