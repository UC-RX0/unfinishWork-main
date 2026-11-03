import { BATTLE_CONFIG } from "../Config/BattleConfig";

/**
 * @description 固定步长时钟
 *
 * 取代原先 World.update 里那个"每渲染帧最多 tick 一次"的累加器。
 * 旧写法在 30fps 下每帧欠一帧、越跑越远，帧号会永久偏移 —— 帧同步里这是致命的。
 *
 * 与上一版的关键区别：
 *   上一版 advance() 一次性算出"这次该跑几步"，然后由 World 循环执行。
 *   在锁步模式下如果中途因为等包卡住，那些已经算出来的步数就白白丢了，
 *   等于客户端永久性变慢。
 *   现在改成 canStep() / consumeStep() 两段式：
 *   先确认能跑，再真正扣时间。卡住就直接 break，时间留在累加器里下次再用。
 *
 * 接帧同步后：逻辑帧不再由真实时间驱动，而是"收到第 N 帧输入"驱动。
 * 到那时把 consumeStep 的触发条件从 canStep 换成 ready(frame) 即可。
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
    /**上一帧是否发生过积压丢弃，可用于打点*/
    public overloaded: boolean = false;

    constructor(fps: number = BATTLE_CONFIG.logicFps, maxCatchUp: number = BATTLE_CONFIG.maxCatchUp) {
        this.fps = fps;
        this.dt = 1 / fps;
        this.maxCatchUp = maxCatchUp;
    }

    /**累积真实时间（带上限保护，防止切后台回来时炸出几百帧）*/
    public addTime(realDt: number): void {
        this.overloaded = false;
        if (realDt > 0.25) realDt = 0.25;
        this.accumulator += realDt;

        const limit = this.dt * this.maxCatchUp;
        if (this.accumulator > limit) {
            this.accumulator = limit;
            this.overloaded = true;
        }
    }

    /**是否够跑一个逻辑帧*/
    public canStep(): boolean {
        return this.accumulator >= this.dt;
    }

    /**真正扣掉一个逻辑帧的时间；务必在确认要执行 tick 之后调用*/
    public consumeStep(): void {
        if (this.accumulator >= this.dt) {
            this.accumulator -= this.dt;
        }
    }

    /**帧间余量 0~1，渲染层用它做插值*/
    public get alpha(): number {
        const a = this.accumulator / this.dt;
        return a < 0 ? 0 : (a > 1 ? 1 : a);
    }

    /**清空累积时间，用于重开一局*/
    public reset(): void {
        this.accumulator = 0;
        this.overloaded = false;
    }
}
