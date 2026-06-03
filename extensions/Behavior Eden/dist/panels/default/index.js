"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const path_1 = __importDefault(require("path"));
const lib_1 = require("../../../lib");
const node_1 = require("../../runtime/node");
const decorator_1 = require("../../runtime/core/decorator");
const utils_1 = require("../../runtime/core/utils");
// 画布宽高
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1400;
// 节点box属性
const BOX_WIDTH = 100;
// const BOX_HEIGHT = 64; //height通过getBoxHeight方法动态计算
const BOX_FILL = "#484848";
const BOX_FILL_ACTIVE = "#E8B116";
const BOX_BORDER_WIDTH = 4;
// 节点main属性
const MAIN_GAP = 4;
const MAIN_WIDTH = BOX_WIDTH - MAIN_GAP * 2;
const MAIN_HEIGHT = 42;
const MAIN_FILL = "#2b2b2b";
const MAIN_BORDER_COLOR = "#121212";
const MAIN_BORDER_WIDTH = 1;
const MAIN_BORDER_RADIUS = 2;
// 节点panel属性
const PANEL_WIDTH = BOX_WIDTH - MAIN_GAP * 2;
const PANEL_HEIGHT = 14;
const PANEL_FILL = "#2C2C2C";
const PANEL_BORDER_RADIUS = 2;
// 删除节点圆圈属性
const REMOVE_RADIUS = 8;
const REMOVE_PADDING = 5;
const REMOVE_CIRCLE_FILL = "#484848";
const REMOVE_LINE_FILL = "#CCCCCC";
const REMOVE_LINE_WIDTH = 2;
// 中断类型属性
const ABORT_RADIUS = 5;
const ABORT_FILL = "#642EA4";
const ABORT_LINE_SIZE = 4;
// 箭头属性
const ARROW_FILL = "#F2F2F2";
const ARROW_SIZE = 6;
const ARROW_LINE_SIZE = 2;
// 辅助线间隔
const LINE_GAP = 20;
// 文本属性
const TEXT_FILL = "#CCCCCC";
const NAME_SIZE = 14;
const TYPE_SIZE = 12;
const TEXT_PADDING = 5;
// 边框半径
const BORDER_RADIUS = 6;
// Root节点属性
const ROOT_X = (CANVAS_WIDTH - BOX_WIDTH) / 2;
const ROOT_Y = 300;
let stage;
let baseLayer;
let bgGroup;
let staticArrowGroup;
let dynamicArrowGroup;
let rootGroup;
let nodeGroup;
let selectionGroup;
// 拖拽panel时生成的动态箭头
let dynamicArrow;
// 当前框选的box（因为计算碰撞只能跟shape碰撞，不能跟group）
let selectedBoxes = [];
// 移动防抖存储相关;
let SAVE_DEBOUNCE_TIMER = null;
const DEBOUNCE_TIME = 200;
// 获取父类构造函数(ts:constructor === class)
const getParentCls = (cls) => { var _a; return cls && ((_a = cls.prototype.__proto__) === null || _a === void 0 ? void 0 : _a.constructor); };
// 生成节点uuid
const uuid = () => Editor.Utils.UUID.generate();
// 防止越界
const clamp = (value, max, min) => (value < min ? min : value > max ? max : value);
// 是否命中
const hit = (x, y, targetX, targetY, targetW, targetH) => x > targetX && y > targetY && x < targetX + targetW && y < targetY + targetH;
// 时间格式化
const getTime = () => {
    const addZero = (value) => (value < 10 ? "0" + value : value);
    const date = new Date();
    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let weekday = addZero(date.getDate());
    let hour = addZero(date.getHours());
    let minute = addZero(date.getMinutes());
    let second = addZero(date.getSeconds());
    return year + "-" + month + "-" + weekday + " " + hour + ":" + minute + ":" + second;
};
const BTreeCompName = "BehaviorTree";
/***
 * 通过btclass装饰器收集到所有节点类型，然后把节点按类型分组，组成以下结构
 * [{
      id: NodeCategory.Composite,
      items: [ { type: NodeType.Selector }, { type: NodeType.Selector } ],
      expand: true}];
 */
const nodeCategory = ((nodeClsMap) => {
    var _a;
    let temp = new Map([
        [node_1.Composite.name, []],
        [node_1.Decorator.name, []],
        [node_1.Condition.name, []],
        [node_1.Action.name, []],
    ]);
    let clsList = [...nodeClsMap.values()];
    for (const cls of clsList) {
        // 获取node的父类cls名字
        const parentCls = getParentCls(cls);
        if (parentCls) {
            const parentClsName = parentCls.name;
            (_a = temp.get(parentClsName)) === null || _a === void 0 ? void 0 : _a.push({
                type: cls.name,
            });
        }
    }
    const result = [...temp.entries()].map(([id, items]) => ({
        id,
        items,
        expand: true,
    }));
    return result;
})(decorator_1.nodeClsMap);
/***
 * 获取所有parentNode类型的节点
 */
const ParentNodes = [...decorator_1.nodeClsMap.values()]
    .filter((cls) => {
    let parentCls = getParentCls(cls);
    while (parentCls) {
        if (parentCls.name === node_1.ParentNode.name) {
            return true;
        }
        parentCls = getParentCls(parentCls);
    }
    return false;
})
    .map((cls) => cls.name);
/***
 * 获取所有Composite类型的节点
 */
const CompositeNodes = [...decorator_1.nodeClsMap.values()]
    .filter((cls) => {
    let parentCls = getParentCls(cls);
    while (parentCls) {
        if (parentCls.name === node_1.Composite.name) {
            return true;
        }
        parentCls = getParentCls(parentCls);
    }
    return false;
})
    .map((cls) => cls.name);
const activeCursor = () => {
    stage && (stage.container().style.cursor = "pointer");
};
const defaultCursor = () => {
    stage && (stage.container().style.cursor = "default");
};
const component = lib_1.Vue.extend({
    template: lib_1.fs.readFileSync(path_1.default.join(__dirname, "../../../src/panels/static/template/vue/app.html"), "utf-8"),
    $: {
        tree: "#tree",
        scroll: "#scroll",
    },
    filters: {
        toUpperCase(value) {
            if (!value) {
                return "";
            }
            const str = value.toString();
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
    },
    data() {
        return {
            onStart: "onStart",
            onUpdate: "onUpdate",
            onEnd: "onEnd",
            // 为了让模板访问,
            AbortType: node_1.AbortType,
            panels: ["Nodes", "Inspector"],
            // 当前选中的panel
            currentPanel: 0,
            // 节点面板
            nodeCategory,
            // json资源列表
            assets: [],
            // 当前选中的json资源
            currentAsset: null,
            // 当前选中的节点
            currentNode: null,
            // 事件相关节点查询的组件和方法信息
            /***
             * 结构如下 {
             *    [lifecycle]:[{ uuid, methods,compName }]
             *    }
             * }
             */
            nodeCompMethodInfo: {},
            logs: [],
            maskText: "",
        };
    },
    computed: {
        nodes() {
            if (this.currentAsset) {
                return this.currentAsset.content.nodes;
            }
            return [];
        },
        nodeMap() {
            const map = {};
            for (const node of this.nodes) {
                map[node.id] = node;
            }
            return map;
        },
        // key是节点id，value是前序索引
        preOrderIndexMap() {
            const root = (0, utils_1.buildTree)(this.nodes);
            if (!root) {
                return {};
            }
            const temp = (0, utils_1.preOrder)(root);
            const map = temp.reduce((total, item, index) => {
                total[item.id] = index;
                return total;
            }, {});
            return map;
        },
        abortTypeList() {
            // 解决数字枚举编译成js以后，生成两份key的问题
            return Object.entries(this.AbortType)
                .filter((e) => !Number.isInteger(Number(e[0])))
                .map((e) => ({ label: e[0], value: e[1] }));
        },
        lifeCycleComponents() {
            return [this.onStart, this.onUpdate, this.onEnd].reduce((total, lifeCycle) => {
                let res = [];
                if (this.currentNode) {
                    const isSelectNode = Boolean(this.currentNode.event[lifeCycle].node);
                    if (isSelectNode) {
                        res = this.nodeCompMethodInfo[lifeCycle] || [];
                    }
                }
                total[lifeCycle] = res;
                return total;
            }, {});
        },
        lifeCycleMethods() {
            return [this.onStart, this.onUpdate, this.onEnd].reduce((total, lifeCycle) => {
                var _a, _b;
                let res = [];
                if (this.currentNode) {
                    const compUuid = (_a = this.currentNode.event[lifeCycle]) === null || _a === void 0 ? void 0 : _a.comp;
                    if (compUuid && this.nodeCompMethodInfo[lifeCycle]) {
                        res = (_b = this.nodeCompMethodInfo[lifeCycle].find((e) => e.uuid === compUuid)) === null || _b === void 0 ? void 0 : _b.methods;
                    }
                }
                total[lifeCycle] = res;
                return total;
            }, {});
        },
    },
    async mounted() {
        this.init();
    },
    methods: {
        /***
         * 初始化相关
         */
        async init() {
            // 初始化画布
            this.initCanvas();
            // 根据当前选中节点初始化行为树
            await this.initSelection();
            this.backRoot();
        },
        initCanvas() {
            // 初始化舞台
            stage = new lib_1.Konva.Stage({
                container: this.$refs.tree,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            });
            // 基础层，目前只有一层，每层都会生成一个canvas
            baseLayer = new lib_1.Konva.Layer();
            // 背景组
            bgGroup = this.generateBg();
            baseLayer.add(bgGroup);
            // 静态箭头层
            staticArrowGroup = new lib_1.Konva.Group();
            baseLayer.add(staticArrowGroup);
            // 动态箭头层（用户手动拉出来的箭头）
            dynamicArrowGroup = this.generateDynamicArrowGroup();
            baseLayer.add(dynamicArrowGroup);
            // Root组
            rootGroup = this.generateRoot();
            baseLayer.add(rootGroup);
            // 节点层
            nodeGroup = new lib_1.Konva.Group();
            baseLayer.add(nodeGroup);
            // 框选层
            selectionGroup = this.generatesSelectionGroup();
            baseLayer.add(selectionGroup);
            // 层添加到舞台
            stage.add(baseLayer);
        },
        // 获取json文件
        async initAssets() {
            const behaviorTreeComponentUuids = [];
            const dfs = (node) => {
                if (!node) {
                    return;
                }
                for (const comp of node.components) {
                    if (comp.type === BTreeCompName) {
                        behaviorTreeComponentUuids.push(comp.value);
                        break;
                    }
                }
                for (const item of node.children) {
                    dfs(item);
                }
            };
            // 获取场景节点树
            const sceneNode = await Editor.Message.request("scene", "query-node-tree");
            // 收集场景上所有BehaviorTree组件uuid
            dfs(sceneNode);
            // 收集BehaviorTree组件上的json路径
            const rawUrls = await Promise.all(behaviorTreeComponentUuids.map((uuid) => Editor.Message.request("scene", "execute-component-method", {
                uuid: uuid,
                name: "getAssetUrl",
            })));
            // 过滤空的并去重
            const urls = [...new Set(rawUrls.filter(Boolean))];
            // 根据url获取所有json文件信息
            const assets = await Promise.all(urls.map((url) => Editor.Message.request("asset-db", "query-asset-info", url)));
            this.assets = assets.map(({ name, source, file }) => ({ name, url: source, file: file, content: "" }));
        },
        async initSelection() {
            // 切换节点时清空全局数据
            selectedBoxes = [];
            SAVE_DEBOUNCE_TIMER = null;
            // 找到当前选中的节点
            const node = await Editor.Message.request("scene", "query-node", Editor.Selection.getSelected("node"));
            // 未选中节点或者选中的是场景节点（场景节点不能添加组件）
            if (!(node === null || node === void 0 ? void 0 : node.__comps__)) {
                this.maskText = "请选中一个非场景根节点非空名称节点来开始行为树制作";
                return;
            }
            // 找到BehaviorTree组件
            const index = node.__comps__.findIndex((v) => v.type === BTreeCompName);
            if (index === -1) {
                this.maskText = "要制作行为树，需要先为当前节点添加行为树组件";
                return;
            }
            const comp = node.__comps__[index];
            //   调用BehaviorTree组件上的方法
            const url = await Editor.Message.request("scene", "execute-component-method", {
                uuid: comp.value.uuid.value,
                name: "getAssetUrl",
            });
            // JSON文件不存在
            if (!url) {
                this.maskText = "当前行为树组件缺少JSON资源，点击BehaviorEditor组件按钮即可创建";
                return;
            }
            this.maskText = "";
            // 选中此文件，设置好currentAsset才能把组件nodes数据同步到JSON
            this.handleSelectAsset(url);
        },
        async handleSelectAsset(url) {
            var _a;
            // 实时获取当前场景所有behaviorTree组件上的json文件
            await this.initAssets();
            const json = this.assets.find((e) => e.url === url);
            if (!json) {
                this.showWarn("JSON文件不存在");
                return;
            }
            if (((_a = this.currentAsset) === null || _a === void 0 ? void 0 : _a.url) === (json === null || json === void 0 ? void 0 : json.url)) {
                return;
            }
            this.currentAsset = json;
            try {
                const content = await lib_1.fs.readJSONSync(json.file);
                this.currentAsset.content = content;
                this.render();
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    // JSON文件语法异常的情况下，初始化内容
                    this.showWarn("JSON文件内容初始化成功");
                    const content = { nodes: [] };
                    await lib_1.fs.writeJSONSync(json.file, content);
                    this.currentAsset.content = content;
                    this.render();
                }
                else {
                    // 输出其他异常
                    this.showWarn(e);
                }
            }
        },
        handlePanelChange(value) {
            this.currentPanel = value;
        },
        handleNameChange(value) {
            if (this.currentNode) {
                this.currentNode.name = value;
                // 需要立刻渲染节点，并防抖存储
                this.render(true, true);
            }
        },
        handleAbortTypeChange(value) {
            if (this.currentNode) {
                this.currentNode.abortType = Number(value);
                this.render();
            }
        },
        async handleEventNodeChange(lifeCycle, uuid = "", shouldSave = true) {
            if (!this.currentNode) {
                this.showWarn("当前节点不存在");
                return;
            }
            this.currentNode.event[lifeCycle].node = uuid;
            if (uuid) {
                await this.getNodeCompMethods(lifeCycle, uuid);
            }
            else {
                this.currentNode.event[lifeCycle].comp = "";
                this.currentNode.event[lifeCycle].method = "";
                // 事件参数就不手动清空了
                // this.currentNode.event[lifeCycle].data = "";
            }
            // 点击canvas某个节点的时候，会触发handleEventNodeChange获取场景节点数据，此时不保存数据
            if (shouldSave) {
                await this.saveAsset();
            }
        },
        async getNodeCompMethods(lifeCycle, uuid) {
            const [nodeInfo, compMethodInfo] = await Promise.all([
                Editor.Message.request("scene", "query-node", uuid),
                Editor.Message.request("scene", "query-component-function-of-node", uuid),
            ]);
            if (!nodeInfo || !compMethodInfo) {
                this.showWarn("节点信息不存在");
                return;
            }
            /***
             * compMethodInfo的组件信息只有组件名，需要获取组件的uuid
             * 组成这样的格式
             */
            const compsMethods = nodeInfo.__comps__.map((comp) => {
                const name = comp.type;
                const uuid = comp.value.uuid.value;
                const methods = compMethodInfo[name];
                return {
                    name,
                    uuid,
                    methods,
                };
            });
            this.nodeCompMethodInfo = Object.assign(Object.assign({}, this.nodeCompMethodInfo), { [lifeCycle]: compsMethods });
        },
        async handleEventCompChange(lifeCycle, uuid) {
            this.currentNode.event[lifeCycle].comp = uuid;
            if (!uuid) {
                this.currentNode.event[lifeCycle].method = "";
            }
            await this.saveAsset();
        },
        async handleEventMethodChange(lifeCycle, method) {
            this.currentNode.event[lifeCycle].method = method;
            await this.saveAsset();
        },
        async handleEventDataChange(lifeCycle, data) {
            this.currentNode.event[lifeCycle].data = data;
            await this.saveAsset();
        },
        async saveAsset() {
            var _a;
            const file = (_a = this.currentAsset) === null || _a === void 0 ? void 0 : _a.file;
            if (!file) {
                this.showWarn("数据存储失败，未指定JSON");
                return;
            }
            const content = this.currentAsset.content;
            // 修改json文件
            lib_1.fs.writeJSONSync(file, content);
        },
        /***
         * 渲染画布
         * renderNode：拖拽的时候不渲染节点
         * debounceSave：防抖存储，用在移动和高频input中
         */
        render(renderNode = true, debounceSave = false) {
            staticArrowGroup.destroyChildren();
            for (const node of this.nodes) {
                this.renderArrow(node);
            }
            clearTimeout(SAVE_DEBOUNCE_TIMER);
            // 渲染节点
            if (renderNode) {
                nodeGroup.destroyChildren();
                for (const node of this.nodes) {
                    this.renderNode(node);
                }
            }
            // 防抖存储
            if (debounceSave) {
                SAVE_DEBOUNCE_TIMER = setTimeout(() => {
                    SAVE_DEBOUNCE_TIMER = null;
                    this.saveAsset();
                }, DEBOUNCE_TIME);
            }
            else {
                this.saveAsset();
            }
        },
        renderNode(node) {
            // 节点组
            const wrapper = this.generateWrapper(node);
            // 节点盒子
            const box = this.generateBox(node);
            // 节点主要内容
            const main = this.generateMain(node);
            // 节点文本
            const [name, type] = this.generateText(node);
            // 节点上下面板
            const [panelStatic, panelDynamic] = this.generatePanel(node);
            // 中断类型icon
            const abortGroup = this.generateAbort(node);
            // 移除节点按钮
            const removeGroup = this.generateRemove(node);
            // 断开箭头按钮
            const breakGroup = this.generateBreak(node);
            wrapper.add(box);
            wrapper.add(main);
            wrapper.add(name);
            wrapper.add(type);
            // 继承ParentNode类型的节点才能显示设置子节点面板
            if (ParentNodes.includes(node.type)) {
                wrapper.add(panelStatic);
                wrapper.add(panelDynamic);
            }
            wrapper.add(abortGroup);
            wrapper.add(removeGroup);
            wrapper.add(breakGroup);
            removeGroup.visible(false);
            breakGroup.visible(false);
            const parentNode = this.getParentNode(node);
            // 有父节点或者是Root节点的时候，渲染break按钮
            const showBreak = Boolean(parentNode || node.isRoot);
            wrapper.on("mouseover", () => {
                !removeGroup.visible() && removeGroup.visible(true);
                !breakGroup.visible() && showBreak && breakGroup.visible(true);
            });
            wrapper.on("mouseout", () => {
                removeGroup.visible() && removeGroup.visible(false);
                breakGroup.visible() && showBreak && breakGroup.visible(false);
            });
            nodeGroup.add(wrapper);
        },
        /***
         * 渲染从父节点指向子节点的箭头
         * getArrowStartXY传入父节点，getArrowEndXY传入子节点
         */
        renderArrow(node) {
            const commonCfg = {
                pointerLength: ARROW_SIZE,
                pointerWidth: ARROW_SIZE,
                fill: ARROW_FILL,
                stroke: ARROW_FILL,
                strokeWidth: ARROW_LINE_SIZE,
            };
            // isRoot标识为true的节点，多渲染一根从Root指向该节点的箭头
            if (node.isRoot) {
                const arrowStartXY = this.getArrowStartXY({
                    x: ROOT_X,
                    y: ROOT_Y,
                });
                const arrowEndXY = this.getArrowEndXY(node);
                const arrow = new lib_1.Konva.Arrow(Object.assign(Object.assign(Object.assign({}, arrowStartXY), { points: [0, 0, arrowEndXY.x - arrowStartXY.x, arrowEndXY.y - arrowStartXY.y] }), commonCfg));
                staticArrowGroup.add(arrow);
            }
            for (const childId of node.children) {
                const childNode = this.nodeMap[childId];
                const arrowStartXY = this.getArrowStartXY(node);
                const arrowEndXY = this.getArrowEndXY(childNode);
                const arrow = new lib_1.Konva.Arrow(Object.assign(Object.assign(Object.assign({}, arrowStartXY), { points: [0, 0, arrowEndXY.x - arrowStartXY.x, arrowEndXY.y - arrowStartXY.y] }), commonCfg));
                staticArrowGroup.add(arrow);
            }
        },
        addNode(type) {
            const node = {
                id: uuid(),
                name: type,
                type,
                abortType: this.AbortType.None,
                x: (CANVAS_WIDTH - BOX_WIDTH) / 2,
                y: ROOT_Y + 100,
                isRoot: false,
                children: [],
                event: {
                    onStart: { node: "", comp: "", method: "", data: "" },
                    onUpdate: { node: "", comp: "", method: "", data: "" },
                    onEnd: { node: "", comp: "", method: "", data: "" },
                },
            };
            this.nodes.push(node);
            this.render();
        },
        removeNode(node) {
            const removeId = node.id;
            // 倒序删除
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const item = this.nodes[i];
                // 删除当前节点
                if (item.id === removeId) {
                    this.nodes.splice(i, 1);
                }
                else {
                    // 删除关系节点
                    item.children = item.children.filter((childId) => childId !== removeId);
                }
            }
            this.render();
            if (this.currentNode === node) {
                this.currentNode = null;
            }
            defaultCursor();
        },
        removeParent(node) {
            // 根节点的话，重置isRoot标识
            if (node.isRoot) {
                node.isRoot = false;
                this.render();
                return;
            }
            const parentNode = this.getParentNode(node);
            if (parentNode) {
                const index = parentNode.children.findIndex((childId) => childId === node.id);
                index > -1 && parentNode.children.splice(index, 1);
                this.render();
            }
            defaultCursor();
        },
        /***
         * 设置子节点
         * node参数是父节点，通过e获取需要设置的子节点
         */
        setChild(e, node) {
            const { x, y } = stage.getPointerPosition();
            // PS：hitNode不可能是Root UI节点，因为Root UI是虚构的，不存在 this.nodes中
            const hitNode = this.nodes.find((node) => {
                const targetX = node.x;
                const targetY = node.y;
                return hit(x, y, targetX, targetY, BOX_WIDTH, this.getBoxHeight(node));
            });
            // 没有命中节点
            if (!hitNode) {
                this.showWarn("未命中节点");
                return;
            }
            // 从Root节点拉出来的箭头，命中普通节点
            if (!node.id) {
                // 命中节点已经是Root节点
                if (hitNode.isRoot) {
                    this.showWarn("命中节点已经是Root节点");
                    return;
                }
                // 删除命中节点原来的关系
                this.removeParent(hitNode);
                // 重置所有isRoot标识
                this.nodes.map((e) => (e.isRoot = false));
                // 设置命中节点Root标识
                hitNode.isRoot = true;
                this.render();
                // 普通节点拉出来的箭头命中普通节点
            }
            else {
                // 命中节点的所有子孙节点（包括命中节点）包含当前节点，会造成循环
                const dirty = this.getAllChildrenNode(hitNode).some((v) => v.id === node.id);
                if (dirty) {
                    this.showWarn("存在循环");
                    return;
                }
                // 命中节点已是当前节点子节点
                const parentHitNode = this.getParentNode(hitNode);
                if ((parentHitNode === null || parentHitNode === void 0 ? void 0 : parentHitNode.id) === node.id) {
                    this.showWarn("命中节点已是当前节点子节点");
                    return;
                }
                // 删除命中节点原来的关系
                this.removeParent(hitNode);
                // 设置新关系
                node.children.push(hitNode.id);
                // 根据x坐标对子节点排序
                this.sortNodeChildren(node);
                this.render();
            }
        },
        getParentNode(node) {
            return this.nodes.find((v) => v.children.includes(node.id));
        },
        sortNodeChildren(node) {
            node.children.sort((a, b) => this.nodeMap[a].x - this.nodeMap[b].x);
        },
        // 获取所有子孙节点
        getAllChildrenNode(node) {
            if (!node) {
                return [];
            }
            let result = [];
            const dfs = (node) => {
                if (!node) {
                    return;
                }
                result.push(node);
                for (const nodeId of node.children) {
                    const child = this.nodeMap[nodeId];
                    dfs(child);
                }
            };
            dfs(node);
            return result;
        },
        /***
         * 移动节点，把xy保存到数据中，并重新渲染箭头
         */
        handleNodeMove(shape) {
            const id = shape.attrs.id;
            if (!id) {
                return;
            }
            const node = this.nodeMap[id];
            node.x = shape.attrs.x;
            node.y = shape.attrs.y;
            const parentNode = this.getParentNode(node);
            // 排序
            if (parentNode) {
                this.sortNodeChildren(parentNode);
            }
            this.render(false, true);
        },
        getArrowStartXY(node) {
            return {
                x: node.x + BOX_WIDTH / 2,
                y: node.y + this.getBoxHeight(node) - PANEL_HEIGHT / 2,
            };
        },
        getArrowEndXY(childNode) {
            const childCenter = childNode.x + BOX_WIDTH / 2;
            return {
                x: childCenter,
                y: childNode.y - 2,
            };
        },
        resetBoxBorder() {
            for (const child of nodeGroup.children) {
                child.children[0].setAttrs({
                    stroke: BOX_FILL,
                });
            }
        },
        getNodeCenter(node) {
            return {
                x: node.x + BOX_WIDTH / 2,
                y: node.y + this.getBoxHeight(node) / 2,
            };
        },
        /***
         * 设置背景和辅助线
         */
        generateBg() {
            const group = new lib_1.Konva.Group();
            const bg = new lib_1.Konva.Rect({
                x: 0,
                y: 0,
                fill: "#262626",
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                id: "bg", //可以通过api find()找到这个节点
            });
            group.add(bg);
            // 辅助线
            for (let i = 0; i < CANVAS_WIDTH / LINE_GAP; i++) {
                const y = i * LINE_GAP;
                const x = i * LINE_GAP;
                if (i % 8 === 0) {
                    const lineCfg = {
                        stroke: "#000000",
                        strokeWidth: 1,
                    };
                    const rowLine = new lib_1.Konva.Line(Object.assign(Object.assign({}, lineCfg), { points: [0, y, CANVAS_WIDTH, y] }));
                    const columnLine = new lib_1.Konva.Line(Object.assign(Object.assign({}, lineCfg), { points: [x, 0, x, CANVAS_HEIGHT] }));
                    group.add(rowLine);
                    group.add(columnLine);
                }
                else {
                    const lineCfg = {
                        stroke: "#343434",
                        strokeWidth: 1,
                    };
                    const rowLine = new lib_1.Konva.Line(Object.assign(Object.assign({}, lineCfg), { points: [0, y, CANVAS_WIDTH, y] }));
                    const columnLine = new lib_1.Konva.Line(Object.assign(Object.assign({}, lineCfg), { points: [x, 0, x, CANVAS_HEIGHT] }));
                    group.add(rowLine);
                    group.add(columnLine);
                }
            }
            return group;
        },
        generateDynamicArrowGroup() {
            const group = new lib_1.Konva.Group();
            dynamicArrow = new lib_1.Konva.Arrow({
                points: [0, 0, 0, 30],
                pointerLength: ARROW_SIZE,
                pointerWidth: ARROW_SIZE,
                fill: ARROW_FILL,
                stroke: ARROW_FILL,
                strokeWidth: ARROW_LINE_SIZE,
                visible: false,
            });
            // 动态箭头离开了canvas,松手的时候隐藏箭头
            stage.on("mouseleave", () => {
                dynamicArrow.visible(false);
            });
            group.add(dynamicArrow);
            return group;
        },
        generatesSelectionGroup() {
            const group = new lib_1.Konva.Group();
            const selection = new lib_1.Konva.Rect({
                fill: "rgba(0,0,0,0.3)",
                visible: false,
            });
            let x1, y1, x2, y2;
            stage.on("mousedown", (e) => {
                e.evt.preventDefault();
                if (e.evt.button === 1) {
                    return;
                }
                const source = e.target;
                const target = stage.find("#bg")[0];
                // 点击的是背景,则开始框选逻辑
                if (source !== target) {
                    return;
                }
                x1 = x2 = stage.getPointerPosition().x;
                y1 = y2 = stage.getPointerPosition().y;
                selection.visible(true);
                selection.width(0);
                selection.height(0);
            });
            stage.on("mousemove", (e) => {
                e.evt.preventDefault();
                // 按下中间则拖拽
                if (e.evt.buttons === 4) {
                    const movementX = e.evt.movementX;
                    const movementY = e.evt.movementY;
                    this.$refs.scroll.scrollBy(-movementX, -movementY);
                    return;
                }
                if (!selection.visible()) {
                    return;
                }
                e.evt.preventDefault();
                x2 = stage.getPointerPosition().x;
                y2 = stage.getPointerPosition().y;
                selection.setAttrs({
                    x: Math.min(x1, x2),
                    y: Math.min(y1, y2),
                    width: Math.abs(x2 - x1),
                    height: Math.abs(y2 - y1),
                });
            });
            stage.on("mouseup", (e) => {
                e.evt.preventDefault();
                // 中键
                if (e.evt.button === 1) {
                    return;
                }
                // 所有点击都会冒泡上来
                if (!selection.visible()) {
                    return;
                }
                const boxes = stage.find(".box");
                const clientRect = selection.getClientRect();
                selectedBoxes = boxes.filter((box) => lib_1.Konva.Util.haveIntersection(clientRect, box.getClientRect({ skipShadow: true })));
                this.resetBoxBorder();
                if (selection.width() !== 0 && selection.height() !== 0 && selectedBoxes.length) {
                    selectedBoxes.forEach((node) => {
                        node.stroke(BOX_FILL_ACTIVE);
                    });
                }
                else {
                    // 没有框选到目标重置激活状态
                    this.currentNode = null;
                    this.handlePanelChange(0);
                    // 每次点击画布都重新渲染，保证最新
                    this.render();
                }
                selection.visible(false);
            });
            group.add(selection);
            return group;
        },
        /***
         * Root节点本身并没有实际意义，只是会指向节点中isRoot标识为true的节点
         */
        generateRoot() {
            // 静态Root节点单独一组，因为要盖住staticArrowGroup，而且nodeGroup每次渲染都会清空
            const group = new lib_1.Konva.Group();
            // 根节点虚构一个node结构，node没有id的话，就是Root节点
            const node = {
                x: ROOT_X,
                y: ROOT_Y,
            };
            const wrapper = new lib_1.Konva.Group(Object.assign({}, node));
            const box = new lib_1.Konva.Rect({
                x: 0,
                y: 0,
                width: BOX_WIDTH,
                height: this.getBoxHeight(node),
                fill: BOX_FILL,
                stroke: BOX_FILL,
                strokeWidth: BOX_BORDER_WIDTH,
                cornerRadius: BORDER_RADIUS,
                shadowColor: "#111111",
                shadowBlur: 16,
                shadowOffset: { x: 2, y: 2 },
            });
            const mainX = (BOX_WIDTH - MAIN_WIDTH) / 2;
            const main = new lib_1.Konva.Rect({
                x: mainX,
                y: MAIN_GAP,
                width: MAIN_WIDTH,
                height: MAIN_HEIGHT,
                fill: MAIN_FILL,
                stroke: MAIN_BORDER_COLOR,
                strokeWidth: MAIN_BORDER_WIDTH,
                cornerRadius: MAIN_BORDER_RADIUS,
            });
            const name = new lib_1.Konva.Text({
                x: mainX + TEXT_PADDING,
                text: "Root",
                fontSize: NAME_SIZE,
                fill: TEXT_FILL,
                width: MAIN_WIDTH,
                height: NAME_SIZE,
            });
            // 文字的大小会影响高度，所以动态设置
            name.setAttrs({
                y: MAIN_GAP * 6 - name.height(),
            });
            const [panelStatic, panelDynamic] = this.generatePanel(Object.assign({}, node));
            wrapper.add(box);
            wrapper.add(main);
            wrapper.add(name);
            wrapper.add(panelStatic);
            wrapper.add(panelDynamic);
            group.add(wrapper);
            return group;
        },
        generateWrapper(node) {
            const BOX_HEIGHT = this.getBoxHeight(node);
            const wrapper = new lib_1.Konva.Group({
                id: node.id,
                x: node.x,
                y: node.y,
                draggable: true,
                dragBoundFunc(currentNodePos) {
                    return {
                        x: clamp(currentNodePos.x, CANVAS_WIDTH - BOX_WIDTH, 0),
                        y: clamp(currentNodePos.y, CANVAS_HEIGHT - BOX_HEIGHT, 0),
                    };
                },
            });
            wrapper.on("dragmove", (e) => {
                wrapper.zIndex(nodeGroup.children.length - 1);
                const movementX = e.evt.movementX;
                const movementY = e.evt.movementY;
                const curMoveShape = e.target;
                // selectedBoxes里存的是box，curMoveShape(e.target)是wrapper
                const selectWrapper = selectedBoxes.map((e) => e.parent);
                const isCurShapeInSelectWrapper = selectWrapper.some((e) => e.attrs.id === curMoveShape.attrs.id);
                // 当前选中的节点是否在框选名单内
                if (isCurShapeInSelectWrapper) {
                    // 在的话，所有节点同时移动
                    for (const item of selectWrapper) {
                        // 其他在框选中的节点，跟着被指定节点移动
                        if (item.attrs.id !== curMoveShape.attrs.id) {
                            item.setAttrs({
                                x: item.attrs.x + movementX,
                                y: item.attrs.y + movementY,
                            });
                        }
                        this.handleNodeMove(item);
                    }
                }
                else {
                    this.handleNodeMove(curMoveShape);
                }
            });
            wrapper.on("click", (e) => {
                // 只支持左键选中
                if (e.evt.button !== 0) {
                    return;
                }
                this.resetBoxBorder();
                selectedBoxes = [];
                this.currentNode = node;
                this.handlePanelChange(1);
                // 获取节点事件相关信息
                this.handleEventNodeChange(this.onStart, this.currentNode.event[this.onStart].node, false);
                this.handleEventNodeChange(this.onUpdate, this.currentNode.event[this.onUpdate].node, false);
                this.handleEventNodeChange(this.onEnd, this.currentNode.event[this.onEnd].node, false);
                this.render();
            });
            return wrapper;
        },
        generateBox(node) {
            var _a;
            const box = new lib_1.Konva.Rect({
                name: "box",
                x: 0,
                y: 0,
                fill: BOX_FILL,
                stroke: ((_a = this.currentNode) === null || _a === void 0 ? void 0 : _a.id) === node.id ? BOX_FILL_ACTIVE : BOX_FILL,
                strokeWidth: BOX_BORDER_WIDTH,
                cornerRadius: BORDER_RADIUS,
                width: BOX_WIDTH,
                height: this.getBoxHeight(node),
                shadowColor: "#111111",
                shadowBlur: 16,
                shadowOffset: { x: 2, y: 2 },
            });
            return box;
        },
        generateMain(node) {
            const mainX = (BOX_WIDTH - MAIN_WIDTH) / 2;
            const main = new lib_1.Konva.Rect({
                x: mainX,
                y: MAIN_GAP,
                fill: MAIN_FILL,
                stroke: MAIN_BORDER_COLOR,
                strokeWidth: MAIN_BORDER_WIDTH,
                cornerRadius: MAIN_BORDER_RADIUS,
                width: MAIN_WIDTH,
                height: MAIN_HEIGHT,
            });
            return main;
        },
        generateRemove(node) {
            const removeGroup = new lib_1.Konva.Group({
                x: BOX_WIDTH,
                y: 0,
            });
            const removeCircle = new lib_1.Konva.Circle({
                x: 0,
                y: 0,
                radius: REMOVE_RADIUS,
                fill: REMOVE_CIRCLE_FILL,
                shadowColor: "black",
                shadowBlur: 8,
                shadowOffset: { x: 4, y: 4 },
            });
            const removeLineLeft = new lib_1.Konva.Line({
                stroke: REMOVE_LINE_FILL,
                strokeWidth: REMOVE_LINE_WIDTH,
                points: [
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                ],
            });
            const removeLineRight = new lib_1.Konva.Line({
                stroke: REMOVE_LINE_FILL,
                strokeWidth: REMOVE_LINE_WIDTH,
                points: [
                    REMOVE_RADIUS - REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                ],
            });
            removeGroup.add(removeCircle);
            removeGroup.add(removeLineLeft);
            removeGroup.add(removeLineRight);
            removeGroup.on("mouseover", activeCursor);
            removeGroup.on("mouseout", defaultCursor);
            removeGroup.on("click", () => {
                this.removeNode(node);
            });
            return removeGroup;
        },
        generatePanel(node) {
            const panelX = (BOX_WIDTH - PANEL_WIDTH) / 2;
            const panelStatic = new lib_1.Konva.Rect({
                x: panelX,
                y: MAIN_HEIGHT + MAIN_GAP * 2.2,
                width: PANEL_WIDTH,
                height: PANEL_HEIGHT,
                fill: PANEL_FILL,
                stroke: MAIN_BORDER_COLOR,
                strokeWidth: MAIN_BORDER_WIDTH,
                cornerRadius: PANEL_BORDER_RADIUS,
            });
            const panelDynamic = new lib_1.Konva.Rect({
                x: panelX,
                y: MAIN_HEIGHT + MAIN_GAP * 2,
                width: PANEL_WIDTH,
                height: PANEL_HEIGHT,
                fill: "transparent",
                cornerRadius: PANEL_BORDER_RADIUS,
                draggable: true,
                dragBoundFunc(currentNodePos) {
                    return {
                        x: clamp(currentNodePos.x, CANVAS_WIDTH - PANEL_WIDTH, 0),
                        y: clamp(currentNodePos.y, CANVAS_HEIGHT - PANEL_HEIGHT, 0),
                    };
                },
            });
            panelDynamic.on("mouseover", activeCursor);
            panelDynamic.on("mouseout", defaultCursor);
            panelDynamic.on("dragstart", (e) => {
                dynamicArrow.setAttrs({
                    x: node.x + BOX_WIDTH / 2,
                    y: node.y + this.getBoxHeight(node),
                    visible: true,
                });
            });
            panelDynamic.on("dragmove", (e) => {
                const { x, y } = stage.getPointerPosition();
                const centerX = node.x + BOX_WIDTH / 2;
                const centerY = node.y + this.getBoxHeight(node);
                dynamicArrow === null || dynamicArrow === void 0 ? void 0 : dynamicArrow.setAttrs({
                    points: [0, 0, clamp(x, CANVAS_WIDTH, 0) - centerX, clamp(y, CANVAS_HEIGHT, 0) - centerY],
                });
            });
            panelDynamic.on("dragend", (e) => {
                // 动态面板归位
                const panelStaticAttrs = panelStatic.attrs;
                panelDynamic.setAttrs({
                    x: panelStaticAttrs.x,
                    y: panelStaticAttrs.y,
                });
                // 隐藏动态箭头
                dynamicArrow.visible(false);
                defaultCursor();
                this.setChild(e, node);
            });
            return [panelStatic, panelDynamic];
        },
        generateText(node) {
            const mainX = (BOX_WIDTH - MAIN_WIDTH) / 2;
            const name = new lib_1.Konva.Text({
                x: mainX + TEXT_PADDING,
                text: node.name,
                fontSize: NAME_SIZE,
                fill: TEXT_FILL,
                width: MAIN_WIDTH,
                height: NAME_SIZE,
                ellipsis: true,
            });
            // 文字的大小会影响高度，所以动态设置
            name.setAttrs({
                y: MAIN_GAP * 6 - name.height(),
            });
            const index = this.preOrderIndexMap[node.id];
            const prefix = index === undefined ? "" : `${index}:`;
            const type = new lib_1.Konva.Text({
                x: mainX + TEXT_PADDING,
                text: `${prefix}${node.type}`,
                fontSize: TYPE_SIZE,
                fill: TEXT_FILL,
                width: MAIN_WIDTH,
                height: TYPE_SIZE,
                ellipsis: true,
            });
            type.setAttrs({
                y: MAIN_GAP * 8.6 - type.height() / 2,
            });
            return [name, type];
        },
        generateAbort(node) {
            const abortGroup = new lib_1.Konva.Group();
            const abortCircle = new lib_1.Konva.Circle({
                x: 0,
                y: 0,
                radius: ABORT_RADIUS,
                fill: ABORT_FILL,
            });
            const commonCfg = {
                x: 0,
                y: 0,
                pointerLength: 5,
                pointerWidth: 8,
                stroke: ABORT_FILL,
                strokeWidth: ABORT_LINE_SIZE,
            };
            const abortArrowDown = new lib_1.Konva.Arrow(Object.assign({ points: [0, -1, 0, 16] }, commonCfg));
            const abortArrowRight = new lib_1.Konva.Arrow(Object.assign({ points: [-1, 0, 16, 0] }, commonCfg));
            switch (node.abortType) {
                case node_1.AbortType.LowerPriority:
                    abortGroup.add(abortCircle);
                    abortGroup.add(abortArrowRight);
                    break;
                case node_1.AbortType.Self:
                    abortGroup.add(abortCircle);
                    abortGroup.add(abortArrowDown);
                    break;
                case node_1.AbortType.Both:
                    abortGroup.add(abortCircle);
                    abortGroup.add(abortArrowRight);
                    abortGroup.add(abortArrowDown);
                    break;
                default:
                    break;
            }
            return abortGroup;
        },
        generateBreak(node) {
            const breakGroup = new lib_1.Konva.Group({
                x: BOX_WIDTH / 2,
                y: 0,
            });
            const breakCircle = new lib_1.Konva.Circle({
                x: 0,
                y: 0,
                radius: REMOVE_RADIUS,
                fill: REMOVE_CIRCLE_FILL,
                shadowColor: "black",
                shadowBlur: 8,
                shadowOffset: { x: 4, y: 4 },
            });
            const breakLineLeft = new lib_1.Konva.Line({
                stroke: REMOVE_LINE_FILL,
                strokeWidth: REMOVE_LINE_WIDTH,
                points: [
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                ],
            });
            const breakLineRight = new lib_1.Konva.Line({
                stroke: REMOVE_LINE_FILL,
                strokeWidth: REMOVE_LINE_WIDTH,
                points: [
                    REMOVE_RADIUS - REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    -REMOVE_RADIUS + REMOVE_PADDING,
                    REMOVE_RADIUS - REMOVE_PADDING,
                ],
            });
            breakGroup.add(breakCircle);
            breakGroup.add(breakLineLeft);
            breakGroup.add(breakLineRight);
            breakGroup.on("mouseover", activeCursor);
            breakGroup.on("mouseout", defaultCursor);
            breakGroup.on("click", () => {
                this.removeParent(node);
            });
            return breakGroup;
        },
        // Action和Condition不需要Panel，所以height动态计算
        getBoxHeight(node) {
            let BOX_HEIGHT = 68;
            // Root节点
            if (node.type === undefined) {
                return BOX_HEIGHT;
            }
            if (!ParentNodes.includes(node.type)) {
                BOX_HEIGHT = BOX_HEIGHT - PANEL_HEIGHT - MAIN_GAP;
            }
            return BOX_HEIGHT;
        },
        isComposite(node) {
            if (!node) {
                return false;
            }
            return CompositeNodes.includes(node.type);
        },
        showWarn(text) {
            let time = getTime();
            const content = `${time}：${text}`;
            while (this.logs.length >= 10) {
                this.logs.shift();
            }
            this.logs.push({ id: uuid(), content });
            console.warn(content);
        },
        // 视角回到root节点
        backRoot() {
            var _a, _b;
            (_b = (_a = this.$refs) === null || _a === void 0 ? void 0 : _a.scroll) === null || _b === void 0 ? void 0 : _b.scroll((CANVAS_WIDTH - this.$refs.scroll.getBoundingClientRect().width) / 2, ROOT_Y - 50);
        },
    },
});
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            // console.log("show");
        },
        hide() {
            // console.log("hide");
        },
    },
    template: lib_1.fs.readFileSync(path_1.default.join(__dirname, "../../../src/panels/static/template/default/index.html"), "utf-8"),
    style: lib_1.fs.readFileSync(path_1.default.join(__dirname, "../../../src/panels/static/style/default/index.css"), "utf-8"),
    $: {
        app: "#app",
    },
    data() {
        return {};
    },
    methods: {
        initSelection() {
            const vm = panelDataMap.get(this);
            if (vm) {
                vm.initSelection();
            }
        },
    },
    ready() {
        if (this.$.app) {
            const vm = new component();
            panelDataMap.set(this, vm);
            vm.$mount(this.$.app);
        }
    },
    beforeClose() { },
    close() {
        const vm = panelDataMap.get(this);
        if (vm) {
            vm.$destroy();
        }
    },
});
