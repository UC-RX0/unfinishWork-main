import { ISystem } from "../Base/ISystem";
import { DamageComponent, PosComponent, VelocityComponent, ViewComponent } from "../Component";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { HitCooldownComponent } from "../Component/HitCooldownComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { MonsterState, MonsterStateStats } from "../Config/MonsterState";
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
 */
export class EnemySpawnSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**下一次允许刷怪的逻辑帧号*/
    private nextSpawnFrame: number = 0;

    init(): void {
        this.enable = true;
        this.nextSpawnFrame = 0;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        if (frame < this.nextSpawnFrame) return;
        this.nextSpawnFrame = frame + BATTLE_CONFIG.spawnIntervalFrames;
        this.spawnOneEnemy();
    }

    /**
     * 刷怪计时器属于"不属于任何组件"的系统私有状态，
     * 不导出的话回滚之后它还停在上一个时间点，重演结果就会和原来不一致。
     */
    public captureState(): any {
        return { nextSpawnFrame: this.nextSpawnFrame };
    }

    public restoreState(data: any): void {
        if (!data) return;
        this.nextSpawnFrame = data.nextSpawnFrame;
    }

    private spawnOneEnemy(): void {
        // 1..4 对应 上右下左
        const side = logicRng.rangeInt(1, 5);
        this.createEnemy(side);
    }

    private createEnemy(side: number) {
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

        // 基础属性
        viewComp.node = resBridge.spawn(PathEnum.Enemy, UIEnum.Enemy);
        viewComp.node.parent = uiMgr.getLayer(LayerEnum.GameLayer);
        healthComp.health = BATTLE_CONFIG.enemyHealth;
        healthComp.maxHealth = BATTLE_CONFIG.enemyHealth;
        velComp.speed = BATTLE_CONFIG.enemyChaseSpeed;
        setVec2(posComp.pos, x, y);
        viewComp.node.setPosition(x, y, 0);
        enemyComp.wave = 0;
        enemyComp.score = 10;
        enemyComp.attackRange = BATTLE_CONFIG.enemyAttackRange;

        // 怪物表现完全由 MonsterVisualSystem 按状态计算，
        // 不再挂 AnimComponent —— 避免和状态机形成两套并行的"状态"
    }
}
