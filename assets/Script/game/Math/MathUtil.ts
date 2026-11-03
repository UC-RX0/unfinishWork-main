/**
 * @description 逻辑层二维向量与数学工具
 *
 * 为什么不直接用 cc.Vec2 / cc.Vec3：
 *   1. ECS 逻辑层不能依赖引擎 —— 依赖了就没法在 Node 里跑双跑校验
 *   2. 引擎向量带一堆方法，每次 link 时容易误用 .clone() / .normalize() 造成隐式分配
 *   3. 组件里存普通对象，做快照/回滚/校验和时直接读字段，不用处理引擎类型
 *
 * 确定性说明：
 *   + - * / 和 Math.sqrt 在 IEEE-754 下是正确舍入的，同样的运算序列在 V8/JSC 上
 *   必然得到 bit-identical 的结果。真正会分叉的是 Math.sin/cos/atan2 这类超越函数，
 *   所以本文件刻意只用四则运算和 sqrt，一个超越函数都没有。
 */

/**逻辑层二维向量（纯数据，无方法）*/
export interface Vec2Like {
    x: number;
    y: number;
}

/**创建一个新的向量对象（会分配内存，只在初始化时用）*/
export function createVec2(x: number = 0, y: number = 0): Vec2Like {
    return { x: x, y: y };
}

/**就地设置分量，避免分配*/
export function setVec2(out: Vec2Like, x: number, y: number): Vec2Like {
    out.x = x;
    out.y = y;
    return out;
}

/**就地拷贝，避免分配*/
export function copyVec2(out: Vec2Like, src: Vec2Like): Vec2Like {
    out.x = src.x;
    out.y = src.y;
    return out;
}

/**长度平方（比长度快，比较距离时优先用它）*/
export function lengthSq(x: number, y: number): number {
    return x * x + y * y;
}

/**两点距离的平方*/
export function distanceSq(ax: number, ay: number, bx: number, by: number): number {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

/**
 * @description 归一化并写入 out
 * 长度为 0 时写入 (0, 0) 并返回 false，调用方据此判断"无方向"。
 * 用返回值而不是抛异常，避免逻辑帧里出现意外的控制流。
 */
export function normalizeTo(out: Vec2Like, x: number, y: number): boolean {
    const lenSq = x * x + y * y;
    if (lenSq <= 0.0000001) {
        out.x = 0;
        out.y = 0;
        return false;
    }
    const inv = 1 / Math.sqrt(lenSq);
    out.x = x * inv;
    out.y = y * inv;
    return true;
}

/**限制到 [-1, 1]，用于把归一化结果钳制进合法范围*/
export function clampUnit(v: number): number {
    if (v > 1) return 1;
    if (v < -1) return -1;
    return v;
}

/**线性插值，用于渲染层插值（逻辑层不要用，会有浮点累积）*/
export function lerp(a: number, b: number, k: number): number {
    return a + (b - a) * k;
}
