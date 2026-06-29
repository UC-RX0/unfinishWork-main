import { Node } from "cc";
/**
* @description 红点管理器
* 1、通过预先注册的方式，将需要管理的红点节点注册到管理器中。
* 需要管理的红点要有相同的层级结构，才能正确显示。类似IoC容器使用主动注入的方式。
* 读取本地数据 得知红点离线的时间，和获得奖励的轮数，通过统一的计算方式，判断红点是否需要显示。
* 2、提供接口，用于设置红点的状态。
* 3、提供接口，用于查询红点的状态。
*/
class ReddotManager {
    private constructor() { }
    private static _instance: ReddotManager;
    public static get instance(): ReddotManager {
        if (!this._instance) {
            this._instance = new ReddotManager();
        }
        return this._instance;
    }
    /**存储红点状态*/
    private redDotMap: Map<Node, boolean> = new Map();





}
export const redDotMgr = ReddotManager.instance;
