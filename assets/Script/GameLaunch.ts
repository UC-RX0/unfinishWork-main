import { AnimationClip, _decorator, Component, instantiate, Node, Prefab, resources, SpriteFrame, Vec3, director } from 'cc';
import { resMgr } from './core/manager/ResManager';
import { LayerEnum, PathEnum, UIEnum, uiMgr } from './core/manager/UIManager';
import { world } from './game/World';
import { AnimComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from './game/Component';
import { IState } from './game/Component/AnimComponent';
import { AnimConfig } from './game/Config/AnimConfig';

const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    private isInit: boolean = false;

    /**缓存，供 WeaponSystem/EnemySpawnSystem 同步使用 */
    static explodeFrames: SpriteFrame[] = [];
    static enemyIdleClip: AnimationClip = null;
    static enemyAttackClip: AnimationClip = null;
    static enemyDeadClip: AnimationClip = null;

    async onLoad() {
        await resMgr.loadAsset(PathEnum.Actor, Prefab, UIEnum.Actor);
        await resMgr.loadAsset(PathEnum.Bullet1, Prefab, UIEnum.Bullet2);
        await resMgr.loadAsset(PathEnum.Weapon, Prefab, UIEnum.Weapon1);
        await resMgr.loadDir("texture/explosion", SpriteFrame);
        await resMgr.loadDir("texture/bullet/bullet2", SpriteFrame);
        await resMgr.loadDir(PathEnum.Bullet1Idle, SpriteFrame);
        await resMgr.loadDir(PathEnum.Bullet1Attack, SpriteFrame);
        await resMgr.loadAsset(PathEnum.Enemy, Prefab, UIEnum.Enemy);
        GameLaunch.enemyIdleClip = await this.loadAnimClip("idle");
        GameLaunch.enemyAttackClip = await this.loadAnimClip("Attack");
        GameLaunch.enemyDeadClip = await this.loadAnimClip("Heart");
        const canvas = director.getScene().getChildByName("Canvas");
        await uiMgr.init();
        await this.init();
    }

    async init() {
        world.init();
        await this.createActor();
        GameLaunch.explodeFrames = resMgr.getSpriteFrames("texture/explosion");
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
        let vel = world.addComp(id, VelocityComponent);
        vel.speed = 100;
        world.addComp(id, PosComponent);

        // 玩家动画：idle + walk
        let animComp: AnimComponent = world.addComp(id, AnimComponent);
        let rawIdle = await resMgr.getAssetByPath(PathEnum.ActorIdle) as any;
        let idleFrames: SpriteFrame[] = Array.isArray(rawIdle) ? rawIdle : [rawIdle];
        let rawWalk = await resMgr.getAssetByPath(PathEnum.ActorRun) as any;
        let walkFrames: SpriteFrame[] = Array.isArray(rawWalk) ? rawWalk : [rawWalk];
        animComp.configs.set(IState.Idle, { type: 'sequence', frames: idleFrames, interval: 0.1, loop: true } as AnimConfig);
        animComp.configs.set(IState.Walk, { type: 'sequence', frames: walkFrames, interval: 0.1, loop: true } as AnimConfig);

        let node = await resMgr.getNodeFromPool(PathEnum.Actor, UIEnum.Actor);
        node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
        world.addComp(id, ViewComponent).node = node;

        await this.createWeapon(id, node);
    }

    private async createWeapon(ownerId: number, parent: Node) {
        let { id } = world.createEntity();
        world.addComp(id, WeaponComponent);
        world.addComp(id, OwnerComponent).ownerId = ownerId;

        // 武器动画：idle（静态） + attack（带 spawn_bullet 事件）
        let animComp: AnimComponent = world.addComp(id, AnimComponent);
        let rawIdle = await resMgr.getAssetByPath(PathEnum.Bullet1Idle) as any;
        let weaponIdle: SpriteFrame[] = Array.isArray(rawIdle) ? rawIdle : [rawIdle];
        let rawAttack = await resMgr.getAssetByPath(PathEnum.Bullet1Attack) as any;
        let weaponAttack: SpriteFrame[] = Array.isArray(rawAttack) ? rawAttack : [rawAttack];
        animComp.configs.set(IState.Idle, { type: 'sequence', frames: weaponIdle, interval: 1, loop: true } as AnimConfig);
        animComp.configs.set(IState.Attack, { type: 'sequence', frames: weaponAttack, interval: 0.08, loop: false, events: { 2: 'spawn_bullet' } } as AnimConfig);

        let viewComp: ViewComponent = world.addComp(id, ViewComponent);
        let weaponRoot = instantiate(await resMgr.getNodeFromPool(PathEnum.Weapon, UIEnum.Weapon1));
        weaponRoot.setParent(parent);
        weaponRoot.setPosition(Vec3.ZERO);
        // 动画帧切换在 Body 节点上
        viewComp.node = weaponRoot.getChildByName("Body") || weaponRoot;
    }

    private loadAnimClip(path: string): Promise<AnimationClip> {
        return new Promise((resolve, reject) => {
            resources.load(path, AnimationClip, (err, clip) => {
                if (err) reject(err); else resolve(clip);
            });
        });
    }

    onDestroy() {
        world.onDestroy();
    }
}