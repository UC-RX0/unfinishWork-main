import { ISystem } from "../Base/ISystem";
import { BattleStateComponent, BattlePhase } from "../Component/BattleStateComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { PlayerInputComponent } from "../Component/PlayerInputComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { buildSpawnQueue, WAVE_TABLE } from "../Config/WaveConfig";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 对局导演（优先级 3，逻辑段）
 *
 * 它是 BattleStateComponent 的【唯一写入者】，负责整局的节奏：
 *
 *   Prepare ──倒计时──► Fighting ──本波清空──► Rest ──倒计时──► Fighting ...
 *                          │                                    │
 *                          └──────── 玩家阵亡 ◄─────────────────┘
 *                                    │
 *                              Defeat / Victory
 *
 * 三个设计要点：
 *
 * 1. 【刷怪指令由它下发，不自己刷】
 *    它只把"下一只该刷什么类型"写进 BattleStateComponent.spawnRequest，
 *    由 EnemySpawnSystem（优先级 5）消费并真正建实体。
 *    两者职责分开：这里管"什么时候"，那里管"怎么建"。
 *
 * 2. 【刷怪队列是推导出来的，不是存下来的】
 *    第 N 波的队列 = buildSpawnQueue(WAVE_TABLE[N-1])，
 *    波次表的类型顺序固定，所以只需要记住"刷到第几个"（waveSpawned）。
 *    少存一份状态，就少一处可能不同步的地方。
 *
 * 3. 【全部整数帧】
 *    倒计时、刷怪间隔、波次计时都是整数帧，帧同步下天然确定。
 */
export class WaveSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [BattleStateComponent];

    /**距下一次刷怪还有多少帧*/
    private spawnTimer: number = 0;

    init(): void {
        this.enable = true;
        this.spawnTimer = 0;
    }

    update(dt: number): void {
        const state = this.getState();
        if (!state) return;

        state.elapsedFrames++;

        // 结算过就不再推进，胜负画面定格
        if (state.settled) return;

        switch (state.phase) {
            case BattlePhase.Prepare:
                this.tickPrepare(state);
                break;
            case BattlePhase.Fighting:
                this.tickFighting(state);
                break;
            case BattlePhase.Rest:
                this.tickRest(state);
                break;
            default:
                break;
        }
    }

    //#region 阶段推进
    /**准备阶段：倒计时结束就开第一波*/
    private tickPrepare(state: BattleStateComponent): void {
        if (state.phaseTimer > 0) {
            state.phaseTimer--;
            return;
        }
        this.beginWave(state, 1);
    }

    /**战斗阶段：按间隔刷怪，并判断本波是否清空*/
    private tickFighting(state: BattleStateComponent): void {
        // 玩家阵亡 → 失败
        if (this.checkDefeat(state)) return;

        // 刷怪：按波次表推导出的队列依次放出来
        if (state.waveSpawned < state.waveTotal) {
            if (this.spawnTimer > 0) {
                this.spawnTimer--;
            } else {
                const queue = buildSpawnQueue(WAVE_TABLE[state.wave - 1]);
                const type = queue[state.waveSpawned];
                // 下发刷怪指令（EnemySpawnSystem 会消费并清零）
                state.spawnRequest = type;
                state.waveSpawned++;
                this.spawnTimer = this.spawnInterval(state.wave);
            }
        }

        // 本波是否已清空：全部刷完 + 场上没有活着的怪
        if (state.waveSpawned >= state.waveTotal && this.countAliveMonsters() === 0) {
            if (state.wave >= state.totalWaves) {
                this.settle(state, BattlePhase.Victory);
            } else {
                state.phase = BattlePhase.Rest;
                state.phaseTimer = BATTLE_CONFIG.restFrames;
                this.healPlayers();
            }
        }
    }

    /**休整阶段：倒计时结束进入下一波*/
    private tickRest(state: BattleStateComponent): void {
        if (state.phaseTimer > 0) {
            state.phaseTimer--;
            return;
        }
        this.beginWave(state, state.wave + 1);
    }

    /**开启第 N 波*/
    private beginWave(state: BattleStateComponent, wave: number): void {
        state.wave = wave;
        state.phase = BattlePhase.Fighting;
        state.waveSpawned = 0;
        const cfg = WAVE_TABLE[wave - 1];
        state.waveTotal = cfg.normal + cfg.fast + cfg.tank;
        state.phaseTimer = 0;
        this.spawnTimer = 0;
    }
    //#endregion

    //#region 胜负
    /**检查是否该判失败：任意玩家血量归零即失败（协作玩法：一人倒下这局就难打了）*/
    private checkDefeat(state: BattleStateComponent): boolean {
        const players = this.world.query(PlayerInputComponent, HealthComponent);
        for (let i = 0; i < players.length; i++) {
            const hp = this.world.getComp(players[i], HealthComponent);
            if (hp && hp.health <= 0) {
                this.settle(state, BattlePhase.Defeat);
                return true;
            }
        }
        return false;
    }

    /**结算：锁定状态，不再推进*/
    private settle(state: BattleStateComponent, phase: BattlePhase): void {
        state.phase = phase;
        state.settled = true;
        state.spawnRequest = -1;
    }
    //#endregion

    //#region 辅助
    /**统计场上活着的怪物（血量 > 0）*/
    private countAliveMonsters(): number {
        const monsters = this.world.query(EnemyComponent, HealthComponent);
        let alive = 0;
        for (let i = 0; i < monsters.length; i++) {
            const hp = this.world.getComp(monsters[i], HealthComponent);
            if (hp && hp.health > 0) alive++;
        }
        return alive;
    }

    /**休整时回血：按最大血量的百分比恢复，不超过上限*/
    private healPlayers(): void {
        const players = this.world.query(PlayerInputComponent, HealthComponent);
        for (let i = 0; i < players.length; i++) {
            const hp = this.world.getComp(players[i], HealthComponent);
            if (!hp) continue;
            const heal = Math.floor(hp.maxHealth * BATTLE_CONFIG.restHealRatio);
            hp.health = Math.min(hp.maxHealth, hp.health + heal);
        }
    }

    /**刷怪间隔：随波次略微加快，但不低于下限*/
    private spawnInterval(wave: number): number {
        const base = BATTLE_CONFIG.spawnIntervalFrames;
        const fast = base - (wave - 1) * BATTLE_CONFIG.spawnIntervalDecay;
        return Math.max(BATTLE_CONFIG.minSpawnIntervalFrames, fast);
    }

    /**取导演实体（全局唯一一个）*/
    private getState(): BattleStateComponent | null {
        const ids = this.world.query(BattleStateComponent);
        if (ids.length === 0) return null;
        return this.world.getComp(ids[0], BattleStateComponent);
    }
    //#endregion

    /**
     * 刷怪计时器属于系统私有状态，必须快照 ——
     * 不存的话回滚之后它停在旧时间点，重演时刷怪节奏就会和原来不一致。
     */
    public captureState(): any {
        return { spawnTimer: this.spawnTimer };
    }

    public restoreState(data: any): void {
        if (!data) return;
        this.spawnTimer = data.spawnTimer;
    }
}
