"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Composite = void 0;
const enum_1 = require("../enum");
const ParentNode_1 = require("./ParentNode");
class Composite extends ParentNode_1.ParentNode {
    constructor(children = [], abortType = enum_1.AbortType.None) {
        super(children);
        this.abortType = abortType;
    }
}
exports.Composite = Composite;
