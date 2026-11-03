import { _decorator, Component, Node } from 'cc';
import { uiMgr, LayerEnum } from './core/manager/UIManager';
import { resBridge } from './core/resource/ResBridge';
import type { IBootProgress } from './core/resource/ResBridge';
import { BATTLE_CONFIG } from './game/Config/BattleConfig';
import { logicRng } from './game/Math/PRNG';
import { NetClient } from './game/Net/NetClient';
import { NetworkInputSource } from './game/Net/NetworkInputSource';
import type { WelcomeMsg } from './game/Net/Protocol';
import { createBattleDirector, createPlayers } from './game/SceneBuilder';
import { ChecksumSystem, MonsterStateProbeSystem, ScriptedInputSystem } from './game/System';
import { world } from './game/World';
import { BattleHud } from './UI/BattleHud';
import { PresentationRig } from './UI/PresentationRig';
import { PlayerInputComponent, ViewComponent } from './game/Component';

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

        // 验证模式：把玩家交给脚本，并打开怪物状态探针
        if (BATTLE_CONFIG.verifyMode) {
            ScriptedInputSystem.enabled = true;
            ScriptedInputSystem.mode = 'orbit';
            MonsterStateProbeSystem.enabled = true;
            console.log("[GameLaunch] 验证模式：脚本输入已接管玩家，怪物状态探针已开启");
        }

        let seed = BATTLE_CONFIG.randomSeed;
        let startFrame = 0;
        let playerCount = 1;

        if (welcome && this.net) {
            // 必须等房间成型：人数没定下来就建世界，两端实体集合不同，必然分叉
            if (!this.net.startMsg) {
                await new Promise<void>((resolve) => {
                    this.net.onStart = () => resolve();
                });
            }
            const start = this.net.startMsg;
            seed = start.seed;
            startFrame = start.frame;
            playerCount = start.playerCount;
            console.log(`[GameLaunch] 房间成型（${playerCount} 人），起始帧 ${startFrame}`);
        }

        // 随机源必须显式重置：模块级单例在重开一局时不会自动回到初始状态，
        // 不重置的话第二次进关的随机序列会接着上一次走，同一个 seed 也复现不出来
        logicRng.restore(seed);
        world.init();

        if (welcome && this.net) {
            world.setStartFrame(startFrame);
            world.setPlayerCount(playerCount);
            this.setupNetworkInput(welcome, playerCount);
        }

        this.buildScene();
        this.setupHud();
        this.setupPresentation();

        this.isInit = true;
        console.log("[GameLaunch] 世界已启动，ECS 进入同步运行期");
    }

    /**
     * @description 装配表现层（相机跟随 / 地图）
     *
     * 相机跟的是玩家 0 的节点 —— 联机时也用玩家 0 做基准，
     * 这样两端相机会朝同一个方向，视觉上不会各看各的。
     */
    private setupPresentation() {
        const layer = uiMgr.getLayer(LayerEnum.GuideLayer);
        if (!layer) return;

        const rigNode = new Node("PresentationRig");
        rigNode.parent = layer;
        const rig = rigNode.addComponent(PresentationRig);

        // 玩家节点：相机要跟随它
        const playerIds = world.query(PlayerInputComponent, ViewComponent);
        if (playerIds.length > 0) {
            const view = world.getComp(playerIds[0], ViewComponent);
            if (view && view.node) {
                // 下一帧再设：PresentationRig.start() 还没跑，CameraFollow 还没挂上
                this.scheduleOnce(() => {
                    rig.setFollowTarget(view.node);
                }, 0);
            }
        }
    }

    /**
     * @description 挂载 HUD
     *
     * HUD 用代码动态创建（工程内没有 UI 预制体），
     * 挂在 GuideLayer 上 —— 提示层永远在最上面，不会被战斗画面盖住。
     */
    private setupHud() {
        const layer = uiMgr.getLayer(LayerEnum.GuideLayer);
        if (!layer) {
            console.error("[GameLaunch] GuideLayer 不存在，HUD 无法挂载");
            return;
        }
        const hudNode = new Node("BattleHud");
        hudNode.parent = layer;
        hudNode.addComponent(BattleHud);
    }

    /**把网络输入源接到 World：此后所有输入都来自服务端帧包*/
    private setupNetworkInput(welcome: WelcomeMsg, playerCount: number) {
        const source = new NetworkInputSource(world.getInputBuffer(), this.net);
        source.localPlayerIndex = welcome.playerIndex;

        this.net.onFrame = (msg) => source.applyFrame(msg);
        this.net.onRoster = (players) => {
            console.log(`[GameLaunch] 房间人数变化 ${players.length}`);
            // 开局后人数再变就麻烦了：已经跑过的帧里没有新玩家的实体，
            // 补建也来不及对齐历史帧。所以这里只提示，不自动补。
            world.setPlayerCount(players.length);
        };

        world.setInputSource(source, playerCount);
        world.networkMode = true;
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
        // 建实体逻辑放在 SceneBuilder，编辑器和 headless 测试共用同一套，
        // 否则两边行为不一致，headless 测出来的结论对编辑器就没意义
        createBattleDirector(world);
        createPlayers(world, world.getPlayerCount());
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
