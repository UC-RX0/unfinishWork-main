import { _decorator, Component, instantiate, Node, Prefab, resources, SpriteFrame, Vec3 } from 'cc';
import { resMgr } from './core/manager/ResManager';
import { LayerEnum, PathEnum, UIEnum, uiMgr } from './core/manager/UIManager';
import { world } from './game/World';
import { AnimComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from './game/Component';
import { IState } from './game/Component/AnimComponent';
const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    private isInit: boolean = false;
    async onLoad() {
        await resMgr.loadAsset(PathEnum.Actor, Prefab, UIEnum.Actor);
        await resMgr.loadAsset(PathEnum.Bullet2, Prefab, UIEnum.Bullet2);
        await uiMgr.init();
        //加载顺序问题 

        await this.init();


    }
    async init() {
        world.init();
        await this.createActor();
        this.isInit = true;
    }


    update(dt: number) {
        if (this.isInit) {
            world.update(dt);
        }
    }

    private async createActor() {
        let { id } = world.createEntity();
        world.addComp(id, PlayerInputComponent).playerIndex = 0;
        world.addComp(id, VelocityComponent).speed = 100;
        world.addComp(id, PosComponent)
        let animComp: AnimComponent = world.addComp(id, AnimComponent);
        animComp.frameDatas.set(IState.Idle, await resMgr.getAssetByPath(PathEnum.ActorIdle) as SpriteFrame[])
        animComp.frameDatas.set(IState.Walk, await resMgr.getAssetByPath(PathEnum.ActorRun) as SpriteFrame[])
        let node = await resMgr.getNodeFromPool(PathEnum.Actor, UIEnum.Actor);
        node.parent = uiMgr.getLayer(LayerEnum.GameLayer);
        world.addComp(id, ViewComponent).node = node;
        await this.createWeapon(id, node);
    }

    private async createWeapon(ownerId: number, parent: Node) {
        let { id } = world.createEntity();
        console.log("createWeapon", id);
        world.addComp(id, WeaponComponent);
        world.addComp(id, OwnerComponent).ownerId = ownerId;
        let viewComp: ViewComponent = world.addComp(id, ViewComponent);
        viewComp.node = instantiate(await resMgr.getNodeFromPool(PathEnum.Weapon, UIEnum.Weapon1));
        viewComp.node.parent = parent;
        viewComp.node.setPosition(Vec3.ZERO);
    }


    onDestroy() {
        world.onDestroy();
    }

}


