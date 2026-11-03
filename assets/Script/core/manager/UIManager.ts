import { _decorator, Asset, BlockInputEvents, Component, director, find, instantiate, Node, Prefab, Vec3, Widget } from 'cc';
import { resBridge } from '../resource/ResBridge';
import { PathEnum, UIEnum } from '../resource/ResEnum';

//资源枚举已迁移至 core/resource/ResEnum.ts，此处重新导出保持既有 import 路径可用
export { PathEnum, UIEnum } from '../resource/ResEnum';

export enum LayerEnum {
    /**主视图层级*/
    MainLayer = 1,
    /**游戏层级*/
    GameLayer,
    /**弹窗层级*/
    PopupLayer,
    /**提示层级*/
    GuideLayer,
    /**锁层级*/
    LockLayer,
}
/**
 * @description UI管理器
 * 本质上属于Prefab管理器 + 层级管理器 作为 UI展示的Pipeline
 * 他需要完成一套标准化的流程 做到UI的加载、显示、隐藏、销毁等操作
 * 本质是向场景中添加节点 并设置节点的父节点为UI节点的子节点
 * 并设置节点的层级为UI节点的层级 + 1
 * 并设置节点的组件为UI组件
*/
class UIManager {
    private constructor() { }
    private static _instance: UIManager = null;
    public static get instance(): UIManager {
        if (this._instance == null) {
            this._instance = new UIManager();
        }
        return this._instance;
    }
    private layerMap: Map<LayerEnum, Node> = new Map();
    private uiMap: Map<UIEnum, Node> = new Map();
    private isInit: boolean = false;



    /**初始化UI管理器
     * 初始化各个层级的节点 并设置层级为UI节点的层级 + 1
    */
    init() {
        let canvas = find("Canvas");
        if (!canvas) {
            console.error("Canvas节点不存在");
            return;
        }
        for (let layer of Object.keys(LayerEnum).filter(key => isNaN(Number(key)))) {
            let node = new Node(layer);
            let widget = node.addComponent(Widget);
            widget.isAlignBottom = widget.isAlignTop = widget.isAlignLeft = widget.isAlignRight = true;
            widget.top = widget.left = widget.right = widget.bottom = 0;
            node.parent = canvas;
            node.setPosition(Vec3.ZERO);
            this.layerMap.set(LayerEnum[layer], node);
            widget.updateAlignment();
        }
        let node = this.layerMap.get(LayerEnum.LockLayer);
        node.addComponent(BlockInputEvents);
        node.active = false;
        // console.log("初始化层级节点", this.layerMap);
        // 必须先置位再注入UI：原实现把 isInit 放在注入之后，
        // 导致 register() 开头的 !isInit 判断直接 return，UI 从未真正注册成功
        this.isInit = true;
        new UIHelper().init();
    }

    /**
     * @description 注册UI节点并向节点池中添加节点
     * 资源已由 ResBridge 在启动期预加载完毕，因此这里改为纯同步实现
     * */
    register(path: string, ui: UIEnum, layer: LayerEnum, type?: new (...args: any[]) => Asset) {
        if (!this.isInit) {
            console.warn(`[UIManager] 未初始化，跳过注册 ${ui}`);
            return;
        }
        let node = this.layerMap.get(layer);
        if (!node) {
            console.error(`层${layer}节点不存在`);
            return;
        }
        // 同步取预制体：缺失会在启动期直接抛错，不会走到这里
        let prefab = resBridge.getPrefab(path, ui);
        if (!prefab) {
            console.error(`资源${path}/${ui}不存在`);
            return;
        }
        let uiNode = instantiate(prefab);
        this.uiMap.set(ui, uiNode);
    }
    /**显示UI节点*/
    showUI(ui: UIEnum, layer: LayerEnum, key?: string, ...params: any[]) {
        if (!this.isInit) {
            return
        }
        let node = this.uiMap.get(ui);
        if (!node) {
            console.error(`UI节点${ui}不存在`);
            return;
        }
        let parentNode = this.getLayer(layer);
        if (!parentNode) {
            console.error(`层${layer}节点不存在`);
            return;
        }
        node.parent = parentNode;
        console.log(`显示UI节点${ui}层级${layer}父节点${parentNode}`);
        node.setPosition(Vec3.ZERO);
    }
    closeUI(ui: UIEnum, cb?: Function) {
        if (!this.isInit) {
            return
        }
        let node = this.uiMap.get(ui);
        if (!node) return;
        node.parent = null;
        node.setPosition(Vec3.ZERO);
        if (cb) cb();
    }
    getUI(ui: UIEnum): Node | null {
        if (!this.isInit) {
            console.error("UI管理器未初始化");
            return null;
        }

        if (!this.uiMap.has(ui)) {
            console.error(`UI节点${ui}不存在`);
            return null;
        }
        return this.uiMap.get(ui);
    }
    getLayer(layer: LayerEnum): Node | null {
        if (!this.isInit) {
            console.error("UI管理器未初始化");
            return null;
        }
        if (!this.layerMap.has(layer)) {
            console.error(`层${layer}节点不存在`);
            return null;
        }
        return this.layerMap.get(layer);
    }
}
/**
 * 用于加载Prefab资源
 * PathEnum / UIEnum 已迁移至 core/resource/ResEnum.ts，与本文件顶部重新导出
*/
class UIHelper {
    /**加载UI节点*/
    init() {
        console.log("UIHelper开始工作，正在向ResMgr中注入UI资源........")
        uiMgr.register(PathEnum.Actor, UIEnum.Actor, LayerEnum.GameLayer, Prefab);
        console.log("UIHelper注入UI资源完成");

    }
}
export const uiMgr = UIManager.instance;


