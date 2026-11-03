import { _decorator, Component, Node, Vec3 } from 'cc';
import { LayerEnum, PathEnum, UIEnum, uiMgr } from './core/manager/UIManager';
import { resBridge } from './core/resource/ResBridge';
import type { IBootProgress } from './core/resource/ResBridge';
import { BATTLE_CONFIG } from './game/Config/BattleConfig';
import { logicRng } from './game/Math/PRNG';
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

    async onLoad() {
        // ---------- 启动期：唯一允许 await 的地方 ----------
        try {
            await resBridge.boot(this.onBootProgress);
        } catch (e) {
            // 缺资源属于致命错误，直接抛出让启动失败，而不是带着空洞继续跑
            console.error(e);
            throw e;
        }

        // 资源已封盘，以下全部是同步流程，不会再有任何一帧被打断
        uiMgr.init();
        // 随机源必须显式重置：模块级单例在重开一局时不会自动回到初始状态，
        // 不重置的话第二次进关的随机序列会接着上一次走，同一个 seed 也复现不出来
        logicRng.restore(BATTLE_CONFIG.randomSeed);
        world.init();
        this.createDeterminismProbe();
        this.buildScene();

        this.isInit = true;
        console.log("[GameLaunch] 世界已启动，ECS 进入同步运行期");
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
        let actorId = this.createActor();
        this.createWeapon(actorId);
    }

    /**
     * 确定性校验探针。
     * ChecksumSystem 会在指定帧把整帧的逻辑校验和写进这个节点的名字，
     * 外部（编辑器/自动化脚本）读节点名就能比对两次运行是否完全一致。
     * 正式发布时可以整段删掉，不影响任何逻辑。
     */
    private createDeterminismProbe() {
        const layer = uiMgr.getLayer(LayerEnum.GuideLayer);
        if (!layer) return;
        const probe = new Node("DET_PROBE");
        probe.parent = layer;
        ChecksumSystem.probeNode = probe;
    }

    /**创建玩家实体*/
    private createActor(): number {
        let { id } = world.createEntity();

        world.addComp(id, PlayerInputComponent).playerIndex = 0;
        let vel = world.addComp(id, VelocityComponent);
        vel.speed = BATTLE_CONFIG.playerSpeed;
        world.addComp(id, PosComponent);
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
        world.onDestroy();
        this.isInit = false;
    }
}
