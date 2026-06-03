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
let ConditionHP = class ConditionHP extends index_1.Condition {
    onUpdate() {
        // console.log("Blackboard.Instance.hp", Blackboard.Instance.hp, "，ConditionHP", Blackboard.Instance.hp >= 100);
        // if (Blackboard.Instance.hp >= 100) {
        //   return NodeStatus.Success;
        // }
        return index_1.NodeStatus.Success;
    }
};
ConditionHP = __decorate([
    (0, decorator_1.btclass)("ConditionHP")
], ConditionHP);
exports.default = ConditionHP;
