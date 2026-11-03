/**
 * @description 快照工具
 *
 * 帧同步的预测+回滚需要把逻辑世界"存下来再还原"。
 * 这里定义快照的数据结构和深拷贝规则。
 *
 * 深拷贝规则（很重要）：
 *   - 原始值（number/string/boolean/null）→ 直接拷贝
 *   - 纯对象（constructor === Object）→ 递归拷贝，例如 Vec2Like {x,y}
 *   - 数组 / Map / Set → 递归拷贝
 *   - 其它一切（Node、SpriteFrame、AnimationClip、Vec3 等引擎对象）→ 保持引用不拷贝
 *
 * 最后一条是关键：引擎对象本身是稳定资源，拷贝它们没有意义还会炸。
 * 视图层的 node 引用在回滚后指向同一个节点，靠渲染层自己去对齐。
 */

/**组件状态快照：一个组件实例的字段拷贝*/
export interface IComponentState {
    /**组件类（回滚是进程内操作，直接持有类引用即可）*/
    cls: any;
    /**所属实体 id*/
    entityId: number;
    /**字段数据（深拷贝后的）*/
    fields: { [key: string]: any };
}

/**系统自定义状态快照*/
export interface ISystemState {
    system: any;
    data: any;
}

/**整个逻辑世界的快照*/
export interface IWorldSnapshot {
    /**快照时的逻辑帧号*/
    frame: number;
    /**实体 id 顺序（决定 query() 的遍历顺序，必须原样还原）*/
    entityOrder: number[];
    /**全部组件状态*/
    components: IComponentState[];
    /**系统自定义状态*/
    systems: ISystemState[];
    /**实体池：下一个可用 id*/
    nextId: number;
    /**实体池：空闲 id 列表（注意要连顺序一起还原）*/
    freeList: number[];
    /**实体池：代号表*/
    generations: Map<number, number>;
    /**随机数状态*/
    rngState: number;
}

/**
 * @description 深拷贝（引擎对象保持引用）
 */
export function copyValue(v: any): any {
    if (v === null || v === undefined) return v;
    const t = typeof v;
    if (t !== "object") return v;

    if (Array.isArray(v)) {
        const out = new Array(v.length);
        for (let i = 0; i < v.length; i++) out[i] = copyValue(v[i]);
        return out;
    }

    if (v instanceof Map) {
        const out = new Map();
        v.forEach((val, key) => out.set(key, copyValue(val)));
        return out;
    }

    if (v instanceof Set) {
        const out = new Set();
        v.forEach((val) => out.add(copyValue(val)));
        return out;
    }

    // 纯对象才递归拷贝；其它（引擎对象）保持引用
    if (v.constructor === Object) {
        const out: any = {};
        for (const key in v) {
            if (Object.prototype.hasOwnProperty.call(v, key)) {
                out[key] = copyValue(v[key]);
            }
        }
        return out;
    }

    return v;
}

/**
 * @description 把组件实例的字段抽成纯数据
 * 只取自有可枚举属性，方法与原型链上的东西不取。
 */
export function captureFields(comp: any): { [key: string]: any } {
    const out: { [key: string]: any } = {};
    for (const key in comp) {
        if (Object.prototype.hasOwnProperty.call(comp, key)) {
            out[key] = copyValue(comp[key]);
        }
    }
    return out;
}

/**
 * @description 把字段写回组件实例
 */
export function restoreFields(comp: any, fields: { [key: string]: any }): void {
    for (const key in fields) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) {
            comp[key] = fields[key];
        }
    }
}
