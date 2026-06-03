"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const decorator_1 = require("../../core/decorator");
let Parallel = class Parallel extends index_1.Composite {
    constructor() {
        super(...arguments);
        this.executionStatus = [];
    }
    onStart() {
        super.onStart();
        this.index = 0;
        this.executionStatus = this.children.map(() => index_1.NodeStatus.Inactive);
    }
    canRunParallelChildren() {
        return true;
    }
    onChildStarted() {
        this.executionStatus[this.index] = index_1.NodeStatus.Running;
        this.index++;
    }
    canExecute() {
        return this.index < this.children.length;
    }
    onChildExecuted(status, index) {
        this.executionStatus[index] = status;
    }
    overrideStatus(_) {
        let childrenComplete = true;
        for (let i = 0; i < this.executionStatus.length; i++) {
            if (this.executionStatus[i] == index_1.NodeStatus.Running) {
                childrenComplete = false;
            }
            else if (this.executionStatus[i] == index_1.NodeStatus.Failure) {
                return index_1.NodeStatus.Failure;
            }
        }
        return childrenComplete ? index_1.NodeStatus.Success : index_1.NodeStatus.Running;
    }
    onConditionalAbort(childIndex) {
        this.index = 0;
        this.executionStatus = this.executionStatus.map(() => index_1.NodeStatus.Inactive);
    }
};
Parallel = __decorate([
    (0, decorator_1.btclass)("Parallel")
], Parallel);
exports.default = Parallel;
