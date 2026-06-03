"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
let Sequence = class Sequence extends index_1.Composite {
    onStart() {
        super.onStart();
        this.index = 0;
    }
    canExecute() {
        return this.index < this.children.length && this.status !== index_1.NodeStatus.Failure;
    }
    onChildExecuted(status, _) {
        switch (status) {
            case index_1.NodeStatus.Success:
                this.index++;
                if (this.index >= this.children.length) {
                    this.status = index_1.NodeStatus.Success;
                }
                else {
                    this.status = index_1.NodeStatus.Running;
                }
                break;
            case index_1.NodeStatus.Failure:
                this.status = index_1.NodeStatus.Failure;
                break;
            case index_1.NodeStatus.Running:
                this.status = index_1.NodeStatus.Running;
                break;
            default:
                break;
        }
    }
    onConditionalAbort(index) {
        this.index = index;
        this.status = index_1.NodeStatus.Inactive;
    }
};
Sequence = __decorate([
    (0, index_1.btclass)("Sequence")
], Sequence);
exports.default = Sequence;
