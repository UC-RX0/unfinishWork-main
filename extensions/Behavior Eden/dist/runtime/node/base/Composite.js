"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Composite = void 0;
const enum_1 = require("../enum");
const ParentNode_1 = require("./ParentNode");
class Composite extends ParentNode_1.ParentNode {
    constructor() {
        super(...arguments);
        this.abortType = enum_1.AbortType.None;
    }
}
exports.Composite = Composite;
