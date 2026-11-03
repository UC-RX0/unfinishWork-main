import { Animation, Node } from "cc";
import { ISystem } from "../Base/ISystem";
import { DamageComponent, PosComponent, VelocityComponent, ViewComponent } from "../Component";
import { BattleStateComponent } from "../Component/BattleStateComponent";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { HitCooldownComponent } from "../Component/HitCooldownComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { MonsterState, MonsterStateStats } from "../Config/MonsterState";
import { EnemyType, ENEMY_TYPE_CFG, WAVE_TABLE } from "../Config/WaveConfig";
import { setVec2 } from "../Math/MathUtil";
import { logicRng } from "../Math/PRNG";
import { resBridge } from "../../core/resource/ResBridge";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../../core/manager/UIManager";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 怪物生成（优先级 5）
 *
 * 确定性改造要点：
 *   1. 战场边界来自 BATTLE_CONFIG，不再读 Canvas 的 UITransform
 *      （逻辑读视图是帧同步的大忌：分辨率不同 → 刷怪点不同 → 立即分叉）
 *   2. 三处 Math.random 全部换成 logicRng，seed 固定/由服务端下发
 *   3. 刷怪节拍改成"帧号调度"而不是"秒数累加"
 *      浮点累加在长时间运行后会有微小误差，帧号调度是纯整数，永远不会漂
 *
 * 波次改造：
 *   刷什么、刷几只由 WaveSystem 决定（写在 BattleStateComponent.spawnRequest 里），
 *   本系统只负责"把那只怪建出来"。职责分开后，调波次节奏不需要动这里。
 */
export class EnemySpawnSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const state = this.getBattleState();
        if (!state) return;

        // 没有刷怪指令就什么都不做
        if (state.spawnRequest < 0) return;

        const type = state.spawnRequest;
        // 立刻清零：本帧只消费一次
        state.spawnRequest = -1;

        this.spawnOneEnemy(type, state.wave);
    }

    /**取对局导演实体（全局唯一一个）*/
    private getBattleState(): BattleStateComponent | null {
        const ids = this.world.query(BattleStateComponent);
        if (ids.length === 0) return null;
        return this.world.getComp(ids[0], BattleStateComponent);
    }

    /**
     * @description 生成一只怪物
     * @param type 怪物类型
     * @param wave 当前波次（决定血量/速度/积分倍率）
     */
    private spawnOneEnemy(type: EnemyType, wave: number): void {
        // 1..4 对应 上右下左
        const side = logicRng.rangeInt(1, 5);
        this.createEnemy(side, type, wave);
    }

    private createEnemy(side: number, type: EnemyType, wave: number) {
        const waveCfg = WAVE_TABLE[wave - 1];
        const typeCfg = ENEMY_TYPE_CFG[type];

        let entity = this.world.createEntity();
        let enemyComp: EnemyComponent = this.world.addComp(entity.id, EnemyComponent);
        this.world.addComp(entity.id, EnemyAIComponent);
        this.world.addComp(entity.id, HitCooldownComponent);
        let posComp: PosComponent = this.world.addComp(entity.id, PosComponent);
        let viewComp: ViewComponent = this.world.addComp(entity.id, ViewComponent);
        let velComp: VelocityComponent = this.world.addComp(entity.id, VelocityComponent);
        let healthComp: HealthComponent = this.world.addComp(entity.id, HealthComponent);
        this.world.addComp(entity.id, DamageComponent).damage = BATTLE_CONFIG.bulletDamage;

        // 怪物状态机：seed 由实体 id 派生，让每只怪物的呼吸/浮动节奏错开，
        // 同时保持确定性（不额外消耗随机数，避免打乱逻辑的随机序列）
        let stateComp: MonsterStateComponent = this.world.addComp(entity.id, MonsterStateComponent);
        stateComp.seed = entity.id % 60;
        stateComp.enterFrame = this.world.frame;
        // 出生时的初始状态（Idle）也要计数，否则"Idle 从未被进入"会被误判为没走到
        MonsterStateStats.enterCount[MonsterState.Idle]++;

        // 计算出生点：四条边随机，全部走确定性随机
        const w = BATTLE_CONFIG.fieldHalfWidth;
        const h = BATTLE_CONFIG.fieldHalfHeight;
        const m = BATTLE_CONFIG.spawnMargin;
        let x = 0;
        let y = 0;
        switch (side) {
            case 1: // 上
                x = logicRng.sign() * logicRng.rangeFloat(w);
                y = h + m;
                break;
            case 2: // 右
                x = w + m;
                y = logicRng.sign() * logicRng.rangeFloat(h);
                break;
            case 3: // 下
                x = logicRng.sign() * logicRng.rangeFloat(w);
                y = -h - m;
                break;
            case 4: // 左
                x = -w - m;
                y = logicRng.sign() * logicRng.rangeFloat(h);
                break;
        }

        // 基础属性：波次倍率 × 类型倍率
        viewComp.node = resBridge.spawn(PathEnum.Enemy, UIEnum.Enemy);
        viewComp.node.parent = uiMgr.getLayer(LayerEnum.GameLayer);
        // 记录预制体标识：节点延迟回收时要还回对应的池子
        viewComp.prefabKey = PathEnum.Enemy;
        viewComp.prefabName = UIEnum.Enemy;
        // clip 动画播在子节点上：clip 里的 position 是绝对轨道，
        // 直接播在根节点会把怪物瞬移到原点
        viewComp.fxNode = this.createFxNode(viewComp.node);
        healthComp.health = Math.round(BATTLE_CONFIG.enemyHealth * waveCfg.healthPct / 100 * typeCfg.healthPct / 100);
        healthComp.maxHealth = healthComp.health;
        velComp.speed = BATTLE_CONFIG.enemyChaseSpeed * waveCfg.speedPct / 100 * typeCfg.speedPct / 100;
        setVec2(posComp.pos, x, y);
        viewComp.node.setPosition(x, y, 0);
        enemyComp.wave = wave;
        enemyComp.type = type;
        enemyComp.scale = typeCfg.scalePct / 100;
        // 击杀分 = 类型基础分 × 波次分倍率
        enemyComp.score = Math.round(typeCfg.score * waveCfg.scorePct / 100);
        enemyComp.attackRange = BATTLE_CONFIG.enemyAttackRange;

        // 怪物表现完全由 MonsterVisualSystem 按状态计算，
        // 不再挂 AnimComponent —— 避免和状态机形成两套并行的"状态"
    }

    /**
     * @description 创建表现层子节点
     *
     * 这个子节点位于原点，专门用来承载 clip 动画。
     * clip 的 position/scale 轨道写的是绝对值，作用在子节点上就变成了
     * 相对根节点的偏移 —— 根节点的位置仍然由逻辑层独占控制。
     *
     * @param root 实体根节点
     * @returns 表现层子节点
     */
    private createFxNode(root: Node): Node {
        const fx = new Node("Fx");
        fx.parent = root;
        fx.setPosition(0, 0, 0);
        return fx;
    }
}
