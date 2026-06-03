"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentNode = void 0;
const Node_1 = require("./Node");
class ParentNode extends Node_1.Node {
    get index() {
        return this._index;
    }
    set index(data) {
        this._index = data;
    }
    constructor(children) {
        super();
        this.children = [];
        this._index = 0;
        this.children = children;
    }
    setChildren(children) {
        this.children = children;
    }
    onConditionalAbort(childIndex) { }
    decorate(status) {
        return status;
    }
    canRunParallelChildren() {
        return false;
    }
    onChildStarted() { }
}
exports.ParentNode = ParentNode;
