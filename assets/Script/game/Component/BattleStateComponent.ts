import { IComponent } from "../Base/IComponent";
import { TOTAL_WAVES } from "../Config/WaveConfig";

/**
 * @description 对局阶段
 */
export enum BattlePhase {
    /**准备：开局倒计时，玩家可以自由走位但还没开始刷怪*/
    Prepare = 0,
    /**战斗：怪物持续涌入*/
    Fighting = 1,
    /**波间休息：回血 + 下一波预告*/
    Rest = 2,
    /**胜利：撑过全部波次*/
    Victory = 3,
    /**失败：玩家阵亡*/
    Defeat = 4,
}

/**阶段名，用于 HUD 文案*/
export const BATTLE_PHASE_NAME = ["准备", "战斗", "休整", "胜利", "失败"];

/**
 * @description 对局状态组件
 *
 * 挂在唯一的"对局导演实体"上，是全局对局进度的事实来源。
 * 它是【纯数据 + 整数帧】，可以完整快照与回滚 —— 帧同步下两端必须完全一致。
 */
export class BattleStateComponent implements IComponent {
    /**当前阶段*/
    phase: BattlePhase = BattlePhase.Prepare;

    /**当前波次（1 起）。0 表示还没进入第一波*/
    wave: number = 0;

    /**总波次数*/
    totalWaves: number = TOTAL_WAVES;

    /**当前阶段剩余帧数*/
    phaseTimer: number = 0;

    /**本波已生成的怪物数量*/
    waveSpawned: number = 0;

    /**本波怪物总数（由波次表推出）*/
    waveTotal: number = 0;

    /**场上存活的怪物数量*/
    monstersAlive: number = 0;

    /**本局总击杀数*/
    kills: number = 0;

    /**本局已经过去的逻辑帧数*/
    elapsedFrames: number = 0;

    /**是否已经结算过（防止重复触发胜负）*/
    settled: boolean = false;

    /**
     * 待刷怪指令：-1 表示无，>=0 表示要刷的怪物类型（EnemyType）。
     * 由 WaveSystem 写入、EnemySpawnSystem 消费并清零。
     * 走组件而不是系统间直接调用，是为了让所有跨系统的数据流都走同一条路径，
     * 快照时自然被一起存档，不需要额外处理。
     */
    spawnRequest: number = -1;
}
