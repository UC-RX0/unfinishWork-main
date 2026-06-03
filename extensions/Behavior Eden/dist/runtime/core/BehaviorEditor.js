"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorEditor = void 0;
const cc_1 = require("cc");
const { ccclass, property } = cc_1._decorator;
/***
 * 方便用户打开插件面板，配合插件的contributions.inspector使用
 * 详见：https://docs.cocos.com/creator/manual/zh/editor/extension/inspector.html
 */
let BehaviorEditor = class BehaviorEditor extends cc_1.Component {
};
BehaviorEditor = __decorate([
    ccclass("BehaviorEditor")
], BehaviorEditor);
exports.BehaviorEditor = BehaviorEditor;
