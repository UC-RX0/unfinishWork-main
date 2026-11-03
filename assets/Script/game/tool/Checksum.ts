/**
 * @description 世界状态校验和（FNV-1a 变体）
 *
 * 只对"逻辑相关"的字段做哈希：位置、速度、血量、状态。
 * 浮点数按【位模式】哈希而不是取整 —— 这样哪怕只有最后一位不同也能立刻发现，
 * 而取整会在分叉很小时把问题藏起来。
 */
export class Checksum {
    /**FNV-1a 32 位偏移基数*/
    private h: number = 2166136261;

    public reset(): void {
        this.h = 2166136261;
    }

    /**混入一个整数*/
    public pushInt(v: number): void {
        this.h = Math.imul(this.h ^ (v | 0), 16777619);
    }

    /**混入一个浮点数（按 IEEE-754 双精度的两个 32 位字）*/
    public pushFloat(v: number): void {
        _f64[0] = v;
        this.h = Math.imul(this.h ^ _i32[0], 16777619);
        this.h = Math.imul(this.h ^ _i32[1], 16777619);
    }

    /**混合当前累加值，用于把多个实体压成一个最终值*/
    public pushHash(other: Checksum): void {
        this.pushInt(other.value);
    }

    public get value(): number {
        return this.h >>> 0;
    }

    public get hex(): string {
        // 手写左侧补零：项目 target 是 ES2016，没有 padStart
        const s = (this.h >>> 0).toString(16);
        let pad = "";
        for (let i = s.length; i < 8; i++) pad += "0";
        return pad + s;
    }
}

// 复用同一块缓冲区，避免每次哈希都分配内存
const _buf = new ArrayBuffer(8);
const _f64 = new Float64Array(_buf);
const _i32 = new Int32Array(_buf);
