import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { resMgr } from './core/manager/ResManager';
import { LayerEnum, PathEnum, UIEnum, uiMgr } from './core/manager/UIManager';
import { world } from './game/World';
import { PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent } from './game/Component';
const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    private isInit: boolean = false;
    async onLoad() {
        await resMgr.loadAsset("Prefab/Actor", Prefab, "Actor");
        // await resMgr.getAssetByName("Prefab/Actor",  "Actor");
        await uiMgr.init();
        //加载顺序问题 

        await this.init();


    }
    async init() {
        world.init();
        let { id, generation } = world.createEntity();
        world.addComp(id, PlayerInputComponent).playerIndex = 0;
        world.addComp(id, VelocityComponent).speed = 100;
        world.addComp(id, PosComponent)

        let node = await resMgr.getNodeFromPool(PathEnum.Actor, UIEnum.Actor);
        node.parent = uiMgr.getLayer(LayerEnum.GameLayer);
        world.addComp(id, ViewComponent).node = node;
        this.isInit = true;
    }


    update(dt: number) {
        if (this.isInit) {
            world.update(dt);
        }
    }



    onDestroy() {
        world.onDestroy();
    }

}


