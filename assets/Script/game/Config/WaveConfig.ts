/**
 * @description 波次配置与怪物类型
 *
 * 全部是整数 / 定点数，且【不依赖分辨率、设备性能、真实时间】——
 * 帧同步要求所有客户端拿到完全一样的波次表，否则实体集合和属性都会分叉。
 *
 * 波次表用"每种怪物的数量"显式声明，而不是随机抽取类型：
 * 显式声明 = 完全确定，省掉一次随机消费，也不会出现某一局全是快怪的极端情况。
 */

/**怪物类型*/
export enum EnemyType {
    /**普通怪：基准属性*/
    Normal = 0,
    /**快速怪：血少、速度快、体型小*/
    Fast = 1,
    /**高血怪：血厚、速度慢、体型大*/
    Tank = 2,
}

/**怪物类型的属性倍率与外观参数*/
export interface IEnemyTypeCfg {
    /**血量倍率（百分比，100 = 1.0 倍）*/
    healthPct: number;
    /**速度倍率（百分比，100 = 1.0 倍）*/
    speedPct: number;
    /**外观缩放（百分比，100 = 1.0 倍）*/
    scalePct: number;
    /**击杀基础分*/
    score: number;
}

/**怪物类型表*/
export const ENEMY_TYPE_CFG: { [k: number]: IEnemyTypeCfg } = {
    [EnemyType.Normal]: { healthPct: 100, speedPct: 100, scalePct: 100, score: 10 },
    [EnemyType.Fast]: { healthPct: 70, speedPct: 160, scalePct: 80, score: 15 },
    [EnemyType.Tank]: { healthPct: 250, speedPct: 80, scalePct: 130, score: 30 },
};

/**
 * @description 单个波次定义
 */
export interface IWaveCfg {
    /**普通怪数量*/
    normal: number;
    /**快速怪数量*/
    fast: number;
    /**高血怪数量*/
    tank: number;
    /**本波血量倍率（百分比）*/
    healthPct: number;
    /**本波速度倍率（百分比）*/
    speedPct: number;
    /**本波击杀分倍率（百分比）*/
    scorePct: number;
}

/**
 * @description 完整波次表
 *
 * 从 10 波递增到 13 只怪，血量从 1.0 倍涨到 2.8 倍，
 * 速度从 1.0 倍涨到 1.4 倍。第 5 波引入快速怪，第 7 波引入高血怪。
 */
export const WAVE_TABLE: IWaveCfg[] = [
    { normal: 3, fast: 0, tank: 0, healthPct: 100, speedPct: 100, scorePct: 100 },
    { normal: 4, fast: 0, tank: 0, healthPct: 100, speedPct: 100, scorePct: 100 },
    { normal: 5, fast: 0, tank: 0, healthPct: 120, speedPct: 105, scorePct: 110 },
    { normal: 6, fast: 0, tank: 0, healthPct: 140, speedPct: 110, scorePct: 120 },
    { normal: 6, fast: 1, tank: 0, healthPct: 160, speedPct: 115, scorePct: 130 },
    { normal: 7, fast: 1, tank: 0, healthPct: 180, speedPct: 120, scorePct: 140 },
    { normal: 6, fast: 2, tank: 1, healthPct: 200, speedPct: 125, scorePct: 150 },
    { normal: 7, fast: 2, tank: 1, healthPct: 220, speedPct: 130, scorePct: 160 },
    { normal: 7, fast: 3, tank: 2, healthPct: 250, speedPct: 135, scorePct: 180 },
    { normal: 8, fast: 3, tank: 2, healthPct: 280, speedPct: 140, scorePct: 200 },
];

/**总波次数*/
export const TOTAL_WAVES = WAVE_TABLE.length;

/**
 * @description 生成一波的刷怪队列
 *
 * 队列是"类型 id 数组"，按 类型轮转 的方式交错排列：
 *   比如 normal=3, fast=1 → [Normal, Fast, Normal, Normal]
 * 这样同类型的怪不会连着出，玩家有喘息节奏。
 *
 * 纯函数、无随机 —— 任何客户端算出来的队列完全一致。
 */
export function buildSpawnQueue(cfg: IWaveCfg): number[] {
    const queue: number[] = [];
    const pools: number[][] = [
        [],
        [],
        [],
    ];
    for (let i = 0; i < cfg.normal; i++) pools[EnemyType.Normal].push(EnemyType.Normal);
    for (let i = 0; i < cfg.fast; i++) pools[EnemyType.Fast].push(EnemyType.Fast);
    for (let i = 0; i < cfg.tank; i++) pools[EnemyType.Tank].push(EnemyType.Tank);

    // 轮转取：每一轮从每个池各取一个，直到全部取完
    let remaining = cfg.normal + cfg.fast + cfg.tank;
    let cursor = 0;
    while (remaining > 0) {
        for (let t = EnemyType.Normal; t <= EnemyType.Tank; t++) {
            if (pools[t].length > 0) {
                queue.push(pools[t].shift());
                remaining--;
            }
        }
        cursor++;
        // 防呆：理论上不会到这里，remaining>0 时必有池非空
        if (cursor > 1000) break;
    }
    return queue;
}
