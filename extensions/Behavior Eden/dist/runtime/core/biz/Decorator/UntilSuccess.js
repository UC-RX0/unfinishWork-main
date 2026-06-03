"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UntilSuccess = void 0;
const index_1 = require("../../index");
let UntilSuccess = class UntilSuccess extends index_1.Decorator {
    canExecute() {
        return this.status == index_1.NodeStatus.Inactive || this.status == index_1.NodeStatus.Failure;
    }
    onChildExecuted(status) {
        this.status = this.decorate(status);
    }
    onUpdate() {
        //   let status: NodeStatus = (this.children[0] as Action | BTCondition).run();
        //   if (status === NodeStatus.Failure) {
        //     status = NodeStatus.Running;
        //   }
        //   return this.decorate(status);
        return index_1.NodeStatus.Success;
    }
};
UntilSuccess = __decorate([
    (0, index_1.btclass)("UntilSuccess")
], UntilSuccess);
exports.UntilSuccess = UntilSuccess;
