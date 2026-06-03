"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wait = void 0;
const index_1 = require("../../index");
let Wait = class Wait extends index_1.Action {
    constructor(duration = 4000) {
        super();
        this.startTime = 0;
        this.duration = 2000;
        this.duration = duration;
    }
    onUpdate() {
        return index_1.NodeStatus.Success;
        return index_1.NodeStatus.Running;
    }
    onStart() {
        super.onStart();
        console.log("Wait onStart");
    }
    onEnd() {
        super.onEnd();
        console.log("Wait onEnd");
    }
};
Wait = __decorate([
    (0, index_1.btclass)("Wait")
], Wait);
exports.Wait = Wait;
