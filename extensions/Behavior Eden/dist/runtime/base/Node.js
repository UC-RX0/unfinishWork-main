"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const enum_1 = require("../core/enum");
class Node {
    constructor() {
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
        return enum_1.NodeStatus.Success;
    }
    onEnd() {
        this.status = enum_1.NodeStatus.Inactive;
    }
}
exports.Node = Node;
