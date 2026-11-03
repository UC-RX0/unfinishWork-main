/**
 * @description 确定性伪随机数（mulberry32）
 *
 * 帧同步的底线：所有客户端必须消耗【完全相同序列】的随机数。
 * Math.random() 不可控、不可复现，是帧同步里最致命的破坏点。
 *
 * 选用 mulberry32 的原因：
 *   - 状态只有一个 32 位整数，快照/回滚成本几乎为零
 *   - 全程只用位运算和 Math.imul（整数乘法，跨引擎完全一致）
 *   - 质量足够做刷怪位置、朝向这类用途
 *
 * 使用纪律（很重要）：
 *   1. 全局只允许存在一个实例，seed 由服务端下发
 *   2. 所有随机消费必须发生在逻辑帧内、且顺序固定
 *   3. 绝不能用它做纯表现（粒子、抖动），否则会打乱逻辑的消费顺序
 *      —— 表现层的随机请另开一个实例或者用确定性哈希
 */
export class PRNG {
    /**32 位无符号状态*/
    private state: number;

    constructor(seed: number = 1) {
        // 保证非 0，否则序列会退化
        this.state = (seed >>> 0) || 0x9e3779b9;
    }

    /**下一个 32 位无符号整数*/
    nextUint(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return (t ^ (t >>> 14)) >>> 0;
    }

    /**[0, 1) 浮点数，仅用于需要比例的逻辑场景*/
    nextFloat(): number {
        return this.nextUint() / 4294967296;
    }

    /**[min, maxExclusive) 整数*/
    rangeInt(min: number, maxExclusive: number): number {
        if (maxExclusive <= min) return min;
        return min + (this.nextUint() % (maxExclusive - min));
    }

    /**[-1, 1] 的符号，替代 Math.random() > 0.5 ? 1 : -1 的写法*/
    sign(): number {
        return (this.nextUint() & 1) === 0 ? 1 : -1;
    }

    /**取 [0, max) 的浮点，供位置采样使用*/
    rangeFloat(max: number): number {
        return this.nextFloat() * max;
    }

    /**导出状态，用于快照*/
    snapshot(): number {
        return this.state;
    }

    /**恢复状态，用于回滚*/
    restore(state: number): void {
        this.state = (state >>> 0) || 0x9e3779b9;
    }
}

/**
 * @description 全局逻辑随机源
 * seed 暂时固定，接入网络后由服务端在开局时下发。
 */
export const logicRng = new PRNG(20261103);
