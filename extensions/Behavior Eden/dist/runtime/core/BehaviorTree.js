"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorTree = exports.BehaviorTreeEvent = void 0;
const cc_1 = require("cc");
const node_1 = require("../node");
const BehaviorEditor_1 = require("./BehaviorEditor");
const BehaviorManager_1 = require("./BehaviorManager");
const BehaviorSource_1 = require("./BehaviorSource");
const { ccclass, property, requireComponent } = cc_1._decorator;
var BehaviorTreeEvent;
(function (BehaviorTreeEvent) {
    BehaviorTreeEvent[BehaviorTreeEvent["BehaviorTreeStart"] = 0] = "BehaviorTreeStart";
    BehaviorTreeEvent[BehaviorTreeEvent["BehaviorTreeEnd"] = 1] = "BehaviorTreeEnd";
})(BehaviorTreeEvent = exports.BehaviorTreeEvent || (exports.BehaviorTreeEvent = {}));
/***
 * 用户真正使用的组件，用来设置单个行为树的运行参数
 */
let BehaviorTree = class BehaviorTree extends cc_1.Component {
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
        this.map = new Map();
        // 当前行为树状态
        this.status = node_1.NodeStatus.Inactive;
    }
    onLoad() {
        // 解析json文件
        this.behaviorSource.parse(this.asset.json);
    }
    /***
     * 仅enableBehavior和disableBehavior属于供用户在自定义脚本中管理单个行为树的方法
     * 其他方法请勿使用
     */
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
    createBehaviorManager() {
        if (!BehaviorManager_1.BehaviorManager.instance) {
            const node = new cc_1.Node("BehaviorManager");
            BehaviorManager_1.BehaviorManager.instance = node.addComponent(BehaviorManager_1.BehaviorManager);
            cc_1.director.getScene().addChild(node);
        }
    }
    /***
     * 发布订阅
     */
    on(event, cb, ctx) {
        if (this.map.has(event)) {
            this.map.get(event).push({ cb, ctx });
        }
        else {
            this.map.set(event, [{ cb, ctx }]);
        }
    }
    off(event, cb, ctx) {
        if (this.map.has(event)) {
            const index = this.map.get(event).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(event).splice(index, 1);
        }
    }
    emit(event, ...params) {
        if (this.map.has(event)) {
            this.map.get(event).forEach(({ cb, ctx }) => {
                cb.apply(ctx, params);
            });
        }
    }
    clear() {
        this.map.clear();
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
], BehaviorTree.prototype, "asset", void 0);
__decorate([
    property(cc_1.CCBoolean)
], BehaviorTree.prototype, "restartWhenComplete", void 0);
__decorate([
    property(cc_1.CCBoolean)
], BehaviorTree.prototype, "startWhenEnabled", void 0);
__decorate([
    property(cc_1.CCBoolean)
], BehaviorTree.prototype, "pauseWhenDisabled", void 0);
__decorate([
    property(cc_1.CCBoolean)
], BehaviorTree.prototype, "logNodeChange", void 0);
BehaviorTree = __decorate([
    ccclass("BehaviorTree"),
    requireComponent(BehaviorEditor_1.BehaviorEditor)
], BehaviorTree);
exports.BehaviorTree = BehaviorTree;
