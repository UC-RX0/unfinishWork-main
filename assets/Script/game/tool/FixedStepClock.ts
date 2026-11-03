import { BATTLE_CONFIG } from "../Config/BattleConfig";

/**
 * @description 固定步长时钟
 *
 * 取代原先 World.update 里那个"每渲染帧最多 tick 一次"的累加器。
 * 旧写法在 30fps 下每帧欠一帧、越跑越远，帧号会永久偏移 —— 帧同步里这是致命的。
 *
 * 这里做三件事：
 *   1. 把不稳定的渲染 dt 累积成固定步长的整数次 tick
 *   2. 限制单次最多补多少帧，防止卡顿后的死亡螺旋
 *   3. 输出 alpha（0~1 的帧间余量），供渲染层做插值
 *
 * 接入帧同步后的变化：
 *   逻辑帧不再由真实时间驱动，而是由"收到第 N 帧输入"驱动。
 *   到那时把 advance() 的调用方从渲染循环换成输入队列即可，
 *   其余部分（tick 序列、alpha、World.frame 语义）完全不用动。
 */
export class FixedStepClock {
    /**逻辑帧率*/
    public readonly fps: number;
    /**单帧步长（秒）*/
    public readonly dt: number;
    /**单次最多补帧数*/
    public readonly maxCatchUp: number;

    /**不足一帧的剩余时间*/
    private accumulator: number = 0;
    /**上一帧是否发生了追帧丢弃，可用于打点*/
    public overloaded: boolean = false;

    constructor(fps: number = BATTLE_CONFIG.logicFps, maxCatchUp: number = BATTLE_CONFIG.maxCatchUp) {
        this.fps = fps;
        this.dt = 1 / fps;
        this.maxCatchUp = maxCatchUp;
    }

    /**
     * @description 推进真实时间，返回本渲染帧应当执行几次逻辑 tick
     * 调用方拿到次数后循环 tick，每次 tick 内部使用 this.dt 这个常量。
     */
    advance(realDt: number): number {
        this.overloaded = false;
        // 防止切后台回来时 realDt 巨大
        if (realDt > 0.25) realDt = 0.25;
        this.accumulator += realDt;

        let steps = 0;
        while (this.accumulator >= this.dt && steps < this.maxCatchUp) {
            this.accumulator -= this.dt;
            steps++;
        }

        // 补满上限仍然积压 → 丢弃剩余时间，宁可丢帧也不要越拖越卡
        if (this.accumulator >= this.dt) {
            this.accumulator = 0;
            this.overloaded = true;
        }
        return steps;
    }

    /**帧间余量 0~1，渲染层用它把两个逻辑帧插值成平滑画面*/
    get alpha(): number {
        return this.accumulator / this.dt;
    }

    /**清空累积时间，用于重开一局*/
    reset(): void {
        this.accumulator = 0;
        this.overloaded = false;
    }
}
