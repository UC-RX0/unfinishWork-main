"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repeater = void 0;
const index_1 = require("../index");
const decorator_1 = require("../../core/decorator");
let Repeater = class Repeater extends index_1.Decorator {
    constructor() {
        super(...arguments);
        this.repeatCount = Infinity;
        this.curCount = 0;
        this.endOnFailure = true;
    }
    /***
     * 参数未来可以通过Shared Variable，这期就不做了
     */
    // constructor(children: Array<Node>, repeatCount = Infinity, endOnFailure = false) {
    //   super(children);
    //   this.repeatCount = repeatCount;
    //   this.endOnFailure = endOnFailure;
    // }
    canExecute() {
        return (this.curCount < this.repeatCount &&
            (!this.endOnFailure || (this.endOnFailure && this.status !== index_1.NodeStatus.Failure)));
    }
    onChildExecuted(status, _) {
        this.curCount++;
        this.status = status;
    }
    onStart() {
        super.onStart();
        this.curCount = 0;
    }
};
Repeater = __decorate([
    (0, decorator_1.btclass)("Repeater")
], Repeater);
exports.Repeater = Repeater;
