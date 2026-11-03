import { ISystem } from "../Base/ISystem";
import { BattleStateComponent } from "../Component/BattleStateComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { ScoreComponent } from "../Component/ScoreComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { MonsterState } from "../Config/MonsterState";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 计分系统（优先级 132，逻辑段）
 *
 * 放在 DeathSystem（130）之后：怪物要先进入 Dead 状态、死亡判定完成，才算一次击杀。
 *
 * 归属规则：击杀者 = 最后一笔伤害的来源实体（子弹）→ 顺着 OwnerComponent 找到玩家。
 * 帧同步下伤害结算顺序固定，所以归属在各端一致。
 *
 * 连击：连续击杀会累积 combo，超过 comboFrames 没击杀就断。
 * 连击给分数加成，让"连续快速清怪"比"慢慢磨"更值钱。
 */
export class ScoreSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [EnemyComponent, HealthComponent, MonsterStateComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        this.tickComboTimers();
        this.collectKills();
    }

    /**连击计时：所有玩家的 combo 都在走，超时清零*/
    private tickComboTimers(): void {
        const ids = this.world.query(ScoreComponent);
        for (let i = 0; i < ids.length; i++) {
            const score = this.world.getComp(ids[i], ScoreComponent);
            if (!score) continue;
            if (score.comboTimer > 0) {
                score.comboTimer--;
                if (score.comboTimer === 0) score.combo = 0;
            }
        }
    }

    /**收集击杀：血量归零且已判定死亡的怪物，记一次分*/
    private collectKills(): void {
        const battle = this.getBattleState();
        const monsters = this.world.query(...this.requiredComponents);

        for (let i = 0; i < monsters.length; i++) {
            const id = monsters[i];
            const hp = this.world.getComp(id, HealthComponent);
            if (!hp || hp.health > 0) continue;

            const st = this.world.getComp(id, MonsterStateComponent);
            // 必须已经进入 Dead 状态 —— 血量归零到状态机切换之间有 1 帧延迟
            if (!st || st.state !== MonsterState.Dead) continue;

            // 防重复计分：同一只怪只能算一次
            if (hp.scored) continue;
            hp.scored = true;

            const enemy = this.world.getComp(id, EnemyComponent);
            const baseScore = enemy ? enemy.score : 0;

            // 击杀者已经记在血量组件上（伤害结算时写入），直接取用
            const playerId = hp.lastKillerId;
            if (playerId >= 0) {
                const score = this.world.getComp(playerId, ScoreComponent);
                if (score) {
                    score.combo++;
                    score.comboTimer = BATTLE_CONFIG.comboFrames;
                    // 连击加成：每层 +10%，最多 +100%
                    const bonus = Math.min(score.combo, 10) * 0.1;
                    score.score += Math.round(baseScore * (1 + bonus));
                    score.kills++;
                }
            }

            if (battle) battle.kills++;
        }
    }

    /**取对局导演实体*/
    private getBattleState(): BattleStateComponent | null {
        const ids = this.world.query(BattleStateComponent);
        if (ids.length === 0) return null;
        return this.world.getComp(ids[0], BattleStateComponent);
    }
}
