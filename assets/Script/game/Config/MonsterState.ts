/**
 * @description 怪物逻辑状态 + 表现配置
 *
 * 设计要点：
 * 1. 状态用枚举，和"动画资源"彻底解耦 —— 以后换序列帧/换美术，这里不动
 * 2. 所有时长以【逻辑帧】为单位（整数），不用秒，帧同步下天然确定
 * 3. 表现是【纯函数】：输入 (状态, 帧龄, 方向)，输出变换量，不做状态累积
 *    —— 纯函数意味着可重放、可回滚、可插值，也不会因为漏清状态而"卡住"
 */

/**怪物逻辑状态*/
export enum MonsterState {
    /**待机*/
    Idle = 0,
    /**移动*/
    Move = 1,
    /**攻击*/
    Attack = 2,
    /**受击*/
    Hit = 3,
    /**死亡*/
    Dead = 4,
}

/**状态名，用于日志*/
export const MONSTER_STATE_NAME = ["Idle", "Move", "Attack", "Hit", "Dead"];

/**
 * @description 表现配置
 * 全部是整数帧或简单倍数，方便直接调参
 */
export const MONSTER_VISUAL_CFG = {
    /**待机：缓慢呼吸*/
    Idle: {
        /**一次呼吸多少帧*/
        periodFrames: 96,
        /**缩放幅度（±）*/
        scaleAmp: 0.05,
    },
    /**移动：上下浮动 + 轻微倾斜*/
    Move: {
        /**一次起伏多少帧*/
        periodFrames: 8,
        /**上下浮动像素*/
        bobAmp: 6,
        /**倾斜角度（度）*/
        tiltAmp: 5,
    },
    /**攻击：朝目标冲刺 → 回弹 + 膨胀*/
    Attack: {
        /**整段多少帧*/
        frames: 18,
        /**冲刺到最远的帧号（同时是伤害结算帧）*/
        lungeFrame: 6,
        /**冲刺距离（像素）*/
        lungeDist: 12,
        /**最大膨胀倍率*/
        punchScale: 0.3,
    },
    /**受击：抖动 + 变色，逐帧衰减*/
    Hit: {
        /**整段多少帧*/
        frames: 12,
        /**抖动幅度（像素）*/
        shakeAmp: 4,
        /**前多少帧变红*/
        flashFrames: 6,
    },
    /**死亡：倒地 + 缩小*/
    Dead: {
        /**整段多少帧，播完才销毁*/
        frames: 24,
        /**最终旋转角度*/
        rotateTo: 90,
    },
};

/**表现求值结果（渲染系统消费）*/
export interface VisualOutput {
    /**表现偏移 X，叠加在逻辑位置之上*/
    offsetX: number;
    /**表现偏移 Y*/
    offsetY: number;
    /**缩放倍率*/
    scale: number;
    /**旋转角度（度）*/
    angle: number;
    /**受击染色强度 0~1，0 为原色*/
    tint: number;
}

/**复用的输出对象，避免每帧 new 产生 GC 抖动*/
const _out: VisualOutput = { offsetX: 0, offsetY: 0, scale: 1, angle: 0, tint: 0 };

/**
 * @description 三角波，周期 1，值域 [-1, 1]
 * 用它替代 Math.sin 做周期性起伏：形状足够柔和，且不引入超越函数
 */
export function tri(x: number): number {
    const f = x - Math.floor(x);
    return f < 0.5 ? f * 4 - 1 : 3 - f * 4;
}

/**线性插值*/
function lerp(a: number, b: number, k: number): number {
    return a + (b - a) * k;
}

/**
 * @description 状态表现求值（纯函数，无副作用）
 * @param state 当前逻辑状态
 * @param t     进入该状态后经过的逻辑帧数（帧龄，从 0 开始）
 * @param seed  相位偏移，让不同怪物的动作不同步
 * @param dirX  朝向（-1 / 0 / 1），用于冲刺方向
 */
export function evalMonsterVisual(
    state: MonsterState,
    t: number,
    seed: number,
    dirX: number
): VisualOutput {
    _out.offsetX = 0;
    _out.offsetY = 0;
    _out.scale = 1;
    _out.angle = 0;
    _out.tint = 0;

    switch (state) {
        case MonsterState.Idle: {
            const cfg = MONSTER_VISUAL_CFG.Idle;
            // 相位错开，避免满屏怪物同一个节奏呼吸
            const phase = (t + seed) / cfg.periodFrames;
            _out.scale = 1 + cfg.scaleAmp * tri(phase);
            break;
        }

        case MonsterState.Move: {
            const cfg = MONSTER_VISUAL_CFG.Move;
            const phase = (t + seed) / cfg.periodFrames;
            _out.offsetY = cfg.bobAmp * tri(phase);
            // 倾斜错开四分之一个周期，形成"迈步"的感觉
            _out.angle = cfg.tiltAmp * tri(phase + 0.25);
            break;
        }

        case MonsterState.Attack: {
            const cfg = MONSTER_VISUAL_CFG.Attack;
            const lungeF = cfg.lungeFrame;
            // 前段冲到最远，后段回弹归零
            const k = t <= lungeF
                ? t / lungeF
                : Math.max(0, 1 - (t - lungeF) / (cfg.frames - lungeF));
            _out.offsetX = cfg.lungeDist * k * (dirX || 1);
            // 冲刺瞬间膨胀，随后回落
            const punch = Math.max(0, 1 - Math.abs(t - lungeF) / lungeF);
            _out.scale = 1 + cfg.punchScale * punch;
            break;
        }

        case MonsterState.Hit: {
            const cfg = MONSTER_VISUAL_CFG.Hit;
            // 逐帧衰减的左右抖动
            const decay = Math.max(0, 1 - t / cfg.frames);
            const dir = (t & 1) === 0 ? 1 : -1;
            _out.offsetX = cfg.shakeAmp * dir * decay;
            _out.tint = t < cfg.flashFrames ? 1 - t / cfg.flashFrames : 0;
            break;
        }

        case MonsterState.Dead: {
            const cfg = MONSTER_VISUAL_CFG.Dead;
            const p = Math.min(t / cfg.frames, 1);
            _out.angle = cfg.rotateTo * p;
            _out.scale = lerp(1, 0, p);
            // 倒地时稍微下沉，视觉上更"塌"
            _out.offsetY = -10 * p;
            break;
        }
    }
    return _out;
}
