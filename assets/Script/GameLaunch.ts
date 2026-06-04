import { _decorator, Component, Node, Prefab, resources } from 'cc';
import { resMgr } from './core/manager/ResManager';
import { LayerEnum, UIEnum, uiMgr } from './core/manager/UIManager';
const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    async onLoad() {
        // await resMgr.loadAsset("Prefab/Actor/Actor", Prefab, "Actor");
        // await resMgr.getAssetByName("Prefab/Actor",  "Actor");
        uiMgr.init();
        // uiMgr.showUI(UIEnum.Actor, LayerEnum.GameLayer);
    }
}


