import { Vec3 } from "cc";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../core/manager/UIManager";
import { resBridge } from "../core/resource/ResBridge";
import { IState } from "./Component/AnimComponent";
import { AnimComponent, BattleStateComponent, HealthComponent, OwnerComponent, PlayerInputComponent, PosComponent, ScoreComponent, VelocityComponent, ViewComponent, WeaponComponent } from "./Component";
import { BATTLE_CONFIG } from "./Config/BattleConfig";
import { setVec2 } from "./Math/MathUtil";
import { IWorld } from "./Base/IWorld";
import { BattlePhase } from "./Component/BattleStateComponent";

/**
 * @description 场景实体构建
 *
 * 把"创建玩家 / 创建武器"从 GameLaunch 里抽出来，理由：
 *   1. 编辑器预览和 headless 测试要用同一套建实体逻辑，否则两边行为不一致，
 *      headless 测出来的结论对编辑器就没意义
 *   2. 联机时要按人数创建多个玩家，这里是唯一的入口
 *
 * 全程同步 —— 资源已由 ResBridge 在启动期加载完毕。
 */

/**
 * @description 创建玩家实体
 * @param world 世界实例
 * @param playerIndex 玩家索引（决定读哪一路输入）
 * @returns 玩家实体 id
 */
export function createPlayer(world: IWorld, playerIndex: number): number {
    const { id } = world.createEntity();

    world.addComp(id, PlayerInputComponent).playerIndex = playerIndex;

    const vel = world.addComp(id, VelocityComponent);
    vel.speed = BATTLE_CONFIG.playerSpeed;

    const pos = world.addComp(id, PosComponent);
    // 多玩家时横向错开出生点，避免完全重叠
    setVec2(pos.pos, playerIndex * 150, 0);

    const health = world.addComp(id, HealthComponent);
    health.health = BATTLE_CONFIG.playerHealth;
    health.maxHealth = BATTLE_CONFIG.playerHealth;

    // 战绩组件：击杀与积分
    world.addComp(id, ScoreComponent);

    // 玩家动画：idle + walk
    const anim: AnimComponent = world.addComp(id, AnimComponent);
    anim.configs.set(IState.Idle, {
        type: 'sequence',
        frames: resBridge.getFrames(PathEnum.ActorIdle),
        interval: 0.1,
        loop: true,
    });
    anim.configs.set(IState.Walk, {
        type: 'sequence',
        frames: resBridge.getFrames(PathEnum.ActorRun),
        interval: 0.1,
        loop: true,
    });

    const node = resBridge.spawn(PathEnum.Actor, UIEnum.Actor);
    node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
    world.addComp(id, ViewComponent).node = node;

    return id;
}

/**
 * @description 创建玩家武器实体
 * @param world 世界实例
 * @param ownerId 主人实体 id
 * @returns 武器实体 id
 */
export function createWeapon(world: IWorld, ownerId: number): number {
    const owner = world.getComp(ownerId, ViewComponent);
    const parent = owner ? owner.node : null;

    const { id } = world.createEntity();
    world.addComp(id, WeaponComponent);
    world.addComp(id, OwnerComponent).ownerId = ownerId;

    // 武器动画：idle（静态） + attack（带 spawn_bullet 事件）
    const anim: AnimComponent = world.addComp(id, AnimComponent);
    anim.configs.set(IState.Idle, {
        type: 'sequence',
        frames: resBridge.getFrames(PathEnum.Bullet1Idle),
        interval: 1,
        loop: true,
    });
    anim.configs.set(IState.Attack, {
        type: 'sequence',
        frames: resBridge.getFrames(PathEnum.Bullet1Attack),
        interval: 0.08,
        loop: false,
        events: { 2: 'spawn_bullet' },
    });

    const viewComp: ViewComponent = world.addComp(id, ViewComponent);
    // spawn 返回的就是可用节点实例
    const weaponRoot = resBridge.spawn(PathEnum.Weapon, UIEnum.Weapon1);
    weaponRoot.setParent(parent);
    weaponRoot.setPosition(Vec3.ZERO);
    // 动画帧切换在 Body 节点上
    viewComp.node = weaponRoot.getChildByName("Body") || weaponRoot;

    return id;
}

/**
 * @description 创建一组玩家（每人带一把武器）
 */
export function createPlayers(world: IWorld, count: number): void {
    for (let i = 0; i < count; i++) {
        const actorId = createPlayer(world, i);
        createWeapon(world, actorId);
    }
}

/**
 * @description 创建对局导演实体
 *
 * 全局唯一一个，持有 BattleStateComponent —— 波次、阶段、胜负的事实来源。
 * 它没有 ViewComponent，因为对局状态不直接对应画面（画面由 HUD 读它渲染）。
 *
 * 初始状态是"准备阶段"，倒计时结束后进入第一波。
 */
export function createBattleDirector(world: IWorld): number {
    const { id } = world.createEntity();
    const state = world.addComp(id, BattleStateComponent);
    state.phase = BattlePhase.Prepare;
    state.phaseTimer = BATTLE_CONFIG.prepareFrames;
    state.wave = 0;
    return id;
}
