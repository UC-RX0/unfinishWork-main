"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inverter = void 0;
const index_1 = require("../../index");
let Inverter = class Inverter extends index_1.Decorator {
    canExecute() {
        return this.status === index_1.NodeStatus.Inactive || this.status === index_1.NodeStatus.Running;
    }
    onChildExecuted(_, status) {
        this.status = status;
    }
    decorate(status) {
        switch (status) {
            case index_1.NodeStatus.Success:
                return index_1.NodeStatus.Failure;
            case index_1.NodeStatus.Failure:
                return index_1.NodeStatus.Success;
            default:
                return status;
        }
    }
};
Inverter = __decorate([
    (0, index_1.btclass)("Inverter")
], Inverter);
exports.Inverter = Inverter;
