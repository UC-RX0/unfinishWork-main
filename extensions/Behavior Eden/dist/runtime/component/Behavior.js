"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Behavior = void 0;
// @ts-ignore
const cc_1 = require("cc");
const BehaviorEditor_1 = require("./BehaviorEditor");
const BehaviorManager_1 = require("./BehaviorManager");
const BehaviorSource_1 = require("../core/BehaviorSource");
const { ccclass, property, requireComponent } = cc_1._decorator;
// 改成BehaviorTree名字，方便用户使用
let Behavior = class Behavior extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.asset = null;
        this.restartWhenComplete = false;
        this.startWhenEnabled = true;
        /***
         * true：节点失活的时候，行为树会保留，仅暂停运行
         * false：节点失活的时候，行为树直接删除
         */
        this.pauseWhenDisabled = false;
        this.logNodeChange = false;
        // 是否被暂停运行了（未开始执行的行为树或者被删除的树都不属于暂停）
        this.isPaused = false;
        // 是否执行完start生成周期，防止start和onEnable重复执行enableBehavior
        this.isInit = false;
        this.behaviorSource = new BehaviorSource_1.BehaviorSource();
    }
    parse() {
        this.behaviorSource.parse(this.asset.json);
    }
    start() {
        if (this.startWhenEnabled) {
            this.enableBehavior();
        }
        this.isInit = true;
    }
    onEnable() {
        if (!this.isInit) {
            return;
        }
        // 运行被暂停或者startWhenEnabled的树
        if (this.isPaused || this.startWhenEnabled) {
            this.enableBehavior();
            this.isPaused = false;
        }
    }
    onDisable() {
        this.disableBehavior();
    }
    enableBehavior() {
        this.createBehaviorManager();
        if (BehaviorManager_1.BehaviorManager.instance) {
            BehaviorManager_1.BehaviorManager.instance.enableBehavior(this);
        }
    }
    disableBehavior(pause = this.pauseWhenDisabled) {
        if (BehaviorManager_1.BehaviorManager.instance) {
            BehaviorManager_1.BehaviorManager.instance.disableBehavior(this, pause);
            this.isPaused = pause;
        }
    }
    createBehaviorManager() {
        if (!BehaviorManager_1.BehaviorManager.instance) {
            const node = new cc_1.Node("BehaviorManager");
            BehaviorManager_1.BehaviorManager.instance = node.addComponent(BehaviorManager_1.BehaviorManager);
            cc_1.director.getScene().addChild(node);
        }
    }
    /***
     * 插件面板初始化时调用
     */
    async getAssetUrl() {
        if (!this.asset) {
            return;
        }
        const uuid = this.asset._uuid;
        // 获取当前json的url
        const url = await Editor.Message.request("asset-db", "query-url", uuid);
        return url;
    }
};
__decorate([
    property(cc_1.JsonAsset)
], Behavior.prototype, "asset", void 0);
__decorate([
    property(cc_1.CCBoolean)
], Behavior.prototype, "restartWhenComplete", void 0);
__decorate([
    property(cc_1.CCBoolean)
], Behavior.prototype, "startWhenEnabled", void 0);
__decorate([
    property(cc_1.CCBoolean)
], Behavior.prototype, "pauseWhenDisabled", void 0);
__decorate([
    property(cc_1.CCBoolean)
], Behavior.prototype, "logNodeChange", void 0);
Behavior = __decorate([
    ccclass("BehaviorTree"),
    requireComponent(BehaviorEditor_1.BehaviorEditor)
], Behavior);
exports.Behavior = Behavior;
