"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const index_1 = require("../index");
const decorator_1 = require("../../core/decorator");
let Log = class Log extends index_1.Action {
    constructor(text = "log") {
        super();
        this.text = "log";
        this.text = text;
    }
    onUpdate() {
        console.log(this.text);
        return index_1.NodeStatus.Success;
    }
};
Log = __decorate([
    (0, decorator_1.btclass)("Log")
], Log);
exports.Log = Log;
