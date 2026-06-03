import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;

/***
 * 方便用户打开插件面板，配合插件的contributions.inspector使用
 * 详见：https://docs.cocos.com/creator/manual/zh/editor/extension/inspector.html
 */
@ccclass("BehaviorEditor")
export class BehaviorEditor extends Component {}
