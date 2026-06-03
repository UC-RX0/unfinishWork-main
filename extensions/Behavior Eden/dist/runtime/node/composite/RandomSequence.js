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
let RandomSequence = class RandomSequence extends index_1.Composite {
    constructor() {
        super(...arguments);
        this.executionOrder = [];
    }
    get index() {
        return this.executionOrder[this.executionOrder.length - 1];
    }
    onStart() {
        super.onStart();
        this.shuffle();
    }
    canExecute() {
        return Boolean(this.executionOrder.length) && this.status !== index_1.NodeStatus.Failure;
    }
    onChildExecuted(status, _) {
        this.executionOrder.pop();
        this.status = status;
    }
    onConditionalAbort() {
        this.executionOrder = [];
        this.status = index_1.NodeStatus.Inactive;
        this.shuffle();
    }
    shuffle() {
        this.executionOrder = [];
        const indexList = Array.from({ length: this.children.length }, (e, i) => i);
        for (let i = indexList.length - 1; i >= 0; i--) {
            const num = Math.floor(Math.random() * indexList.length);
            this.executionOrder.push(indexList.splice(num, 1)[0]);
        }
    }
};
RandomSequence = __decorate([
    (0, decorator_1.btclass)("RandomSequence")
], RandomSequence);
exports.default = RandomSequence;
