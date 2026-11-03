import { _decorator, Component, Node, Vec3 } from 'cc';
import { LayerEnum, PathEnum, UIEnum, uiMgr } from './core/manager/UIManager';
import { resBridge } from './core/resource/ResBridge';
import type { IBootProgress } from './core/resource/ResBridge';
import { BATTLE_CONFIG } from './game/Config/BattleConfig';
import { logicRng } from './game/Math/PRNG';
import { setVec2 } from './game/Math/MathUtil';
import { NetClient } from './game/Net/NetClient';
import { NetworkInputSource } from './game/Net/NetworkInputSource';
import type { WelcomeMsg } from './game/Net/Protocol';
import { ChecksumSystem } from './game/System';
import { IState } from './game/Component/AnimComponent';
import { AnimComponent, HealthComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from './game/Component';
import { world } from './game/World';

const { ccclass, property } = _decorator;

/**
 * @description 游戏入口
 * 负责把两段完全不同的时间轴衔接起来：
 *
 *   【启动期】onLoad → await resBridge.boot()  ← 全项目唯一允许异步的地方
 *   ────────────────── 封盘 ──────────────────
 *   【运行期】world.init() / 建实体 / 每帧 update  ← 全部同步
 *
 * 资源没加载完，世界不会启动；资源一旦封盘，运行期就再也拿不到异步能力。
 */
@ccclass('GameLaunch')
export class GameLaunch extends Component {
    /**世界是否已启动，未启动时 update 不推进 ECS*/
    private isInit: boolean = false;
    /**联机客户端，单机模式下为 null*/
    private net: NetClient = null;

    async onLoad() {
        // ---------- 启动期：唯一允许 await 的地方 ----------
        try {
            await resBridge.boot(this.onBootProgress);
        } catch (e) {
            // 缺资源属于致命错误，直接抛出让启动失败，而不是带着空洞继续跑
            console.error(e);
            throw e;
        }

        // 联机模式：必须先握手拿到 seed / playerIndex / 人数，再启动世界。
        // 种子必须用服务端下发的，否则各端的刷怪序列从第一帧就不一样。
        let welcome: WelcomeMsg = null;
        if (BATTLE_CONFIG.net.enabled) {
            this.net = new NetClient();
            try {
                welcome = await this.net.connect(BATTLE_CONFIG.net.url);
                console.log(`[GameLaunch] 联机模式 我是玩家 ${welcome.playerIndex}，房间 ${welcome.playerCount} 人`);
            } catch (e) {
                // 连不上服务端不应该让整个游戏起不来：降级成单机继续跑
                console.error(`[GameLaunch] 联机失败，自动回退单机模式：${e}`);
                this.net.close();
                this.net = null;
                welcome = null;
            }
        }

        // 资源已封盘，以下全部是同步流程，不会再有任何一帧被打断
        uiMgr.init();
        // 随机源必须显式重置：模块级单例在重开一局时不会自动回到初始状态，
        // 不重置的话第二次进关的随机序列会接着上一次走，同一个 seed 也复现不出来
        logicRng.restore(welcome ? welcome.seed : BATTLE_CONFIG.randomSeed);
        world.init();

        if (welcome && this.net) {
            // 帧号必须与服务端对齐，否则输入缓冲里的帧号永远匹配不上
            world.setStartFrame(welcome.frame);
            this.setupNetworkInput(welcome);
        }

        this.buildScene();

        this.isInit = true;
        console.log("[GameLaunch] 世界已启动，ECS 进入同步运行期");
    }

    /**把网络输入源接到 World：此后所有输入都来自服务端帧包*/
    private setupNetworkInput(welcome: WelcomeMsg) {
        const source = new NetworkInputSource(world.getInputBuffer(), this.net);
        source.localPlayerIndex = welcome.playerIndex;

        this.net.onFrame = (msg) => source.applyFrame(msg);
        this.net.onRoster = (players) => {
            console.log(`[GameLaunch] 房间人数变化 ${players.length}`);
            world.setPlayerCount(players.length);
        };

        world.setInputSource(source, welcome.playerCount);
        // 定期上报校验和，服务端负责跨客户端比对
        ChecksumSystem.onChecksum = (frame, hex) => this.net.sendChecksum(frame, hex);
    }

    update(dt: number) {
        if (this.isInit) {
            world.update(dt);
        }
    }

    /**启动进度回调，后续可在此驱动 loading 进度条*/
    private onBootProgress(p: IBootProgress) {
        // 目前只打印，接 loading UI 时把这里换成进度条赋值即可
        console.log(`[Boot] ${(p.ratio * 100).toFixed(0)}%  ${p.label}`);
    }

    /**创建场景内的初始实体（全同步）*/
    private buildScene() {
        // 联机时按服务端下发的人数逐个创建玩家；单机时为 1
        const count = world.getPlayerCount();
        for (let i = 0; i < count; i++) {
            const actorId = this.createActor(i);
            this.createWeapon(actorId);
        }
    }

    /**创建玩家实体*/
    private createActor(playerIndex: number): number {
        let { id } = world.createEntity();

        world.addComp(id, PlayerInputComponent).playerIndex = playerIndex;
        let vel = world.addComp(id, VelocityComponent);
        vel.speed = BATTLE_CONFIG.playerSpeed;
        const pos = world.addComp(id, PosComponent);
        // 多玩家时横向错开出生点，避免完全重叠
        setVec2(pos.pos, playerIndex * 150, 0);
        //玩家生命值
        world.addComp(id, HealthComponent).health = BATTLE_CONFIG.playerHealth;

        // 玩家动画：idle + walk，序列帧直接同步取
        let animComp: AnimComponent = world.addComp(id, AnimComponent);
        animComp.configs.set(IState.Idle, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.ActorIdle),
            interval: 0.1,
            loop: true,
        });
        animComp.configs.set(IState.Walk, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.ActorRun),
            interval: 0.1,
            loop: true,
        });

        let node = resBridge.spawn(PathEnum.Actor, UIEnum.Actor);
        node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
        world.addComp(id, ViewComponent).node = node;

        return id;
    }

    /**创建玩家武器实体*/
    private createWeapon(ownerId: number) {
        let parent = world.getComp(ownerId, ViewComponent).node;

        let { id } = world.createEntity();
        world.addComp(id, WeaponComponent);
        world.addComp(id, OwnerComponent).ownerId = ownerId;

        // 武器动画：idle（静态） + attack（带 spawn_bullet 事件）
        let animComp: AnimComponent = world.addComp(id, AnimComponent);
        animComp.configs.set(IState.Idle, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.Bullet1Idle),
            interval: 1,
            loop: true,
        });
        animComp.configs.set(IState.Attack, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.Bullet1Attack),
            interval: 0.08,
            loop: false,
            events: { 2: 'spawn_bullet' },
        });

        let viewComp: ViewComponent = world.addComp(id, ViewComponent);
        // spawn 返回的就是可用节点实例，原实现里又套了一层 instantiate，白白多创建了一个节点
        let weaponRoot = resBridge.spawn(PathEnum.Weapon, UIEnum.Weapon1);
        weaponRoot.setParent(parent);
        weaponRoot.setPosition(Vec3.ZERO);
        // 动画帧切换在 Body 节点上
        viewComp.node = weaponRoot.getChildByName("Body") || weaponRoot;
    }

    onDestroy() {
        if (this.net) {
            this.net.close();
            this.net = null;
        }
        ChecksumSystem.onChecksum = null;
        world.onDestroy();
        this.isInit = false;
    }
}
