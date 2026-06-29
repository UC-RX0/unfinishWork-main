import { _decorator, Asset, Component, director, find, instantiate, Node, Prefab, Vec3, Widget } from 'cc';
import { resMgr } from './ResManager';
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
        // console.log("初始化层级节点", this.layerMap);
        new UIHelper().init();
        this.isInit = true;
    }

    /**
     * @description 注册UI节点并向节点池中添加节点
     * 要新增一个回响时间 防止在初始化前调用注册方法
     * */
    async register(path: string, ui: UIEnum, layer: LayerEnum, type?: new (...args: any[]) => Asset) {
        if (!this.isInit) {
            return
        }
        let node = this.layerMap.get(layer);
        if (!node) {
            console.error(`层${layer}节点不存在`);
            return;
        }
        // 加载Prefab资源
        let prefab = await resMgr.getAssetByName(path, ui) as Prefab;
        if (!prefab) {
            console.error(`资源${path}不存在`);
            return;
        }
        let uiNode = instantiate(prefab);
        this.uiMap.set(ui, uiNode);
        console.log(`注册成功`, this.uiMap);
        // resMgr.putNodeToPool(uiNode, path, ui);

    }
    /**显示UI节点*/
    async showUI(ui: UIEnum, layer: LayerEnum, key?: string, ...params: any[]) {
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
export enum PathEnum {
    /**角色UI*/
    Actor = "Prefab/Actor",
    ActorIdle = "texture/actor/idle",
    ActorRun = "texture/actor/run",
}
/**
 * 用于加载Prefab资源
*/
export enum UIEnum {
    /**角色UI*/
    Actor = "Actor",
}
class UIHelper {
    /**加载UI节点*/
    init() {
        uiMgr.register(PathEnum.Actor, UIEnum.Actor, LayerEnum.GameLayer, Prefab);
    }
}
export const uiMgr = UIManager.instance;


