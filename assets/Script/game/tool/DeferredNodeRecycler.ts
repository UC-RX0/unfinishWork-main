import { PathEnum, UIEnum } from "../../core/manager/UIManager";
import { resBridge } from "../../core/resource/ResBridge";

/**
 * @description 延迟节点回收器
 *
 * 【为什么需要它】
 *   回滚要求"实体在回滚后能复活"。
 *   如果死亡时就把节点 destroy() 了，回滚到实体还活着的时刻时，
 *   节点已经不存在了 —— 实体复活了但没有画面。
 *
 *   所以节点要先隐藏，等过了【回滚窗口】才真正回收。
 *   窗口 = 回滚能回退的最大帧数。窗口内的死亡，节点必须保留。
 *
 * 【为什么不能直接 recycle 到池】
 *   池里的节点随时可能被拿去给新实体用。
 *   如果一个"待回滚复活"的节点被借走了，回滚时就会张冠李戴。
 *   所以窗口内只隐藏，不入池；窗口过后才真正回收。
 */
export class DeferredNodeRecycler {
    /**待回收记录：节点 -> { frame, key, name }*/
    private static pending: Map<any, IPendingNode> = new Map();

    /**
     * 回滚窗口（逻辑帧）：窗口内的死亡节点不回收。
     * 必须 >= 回滚控制器能回退的最大帧数，否则回滚会复活出一个没有节点的实体。
     */
    public static rollbackWindowFrames: number = 300;

    /**
     * 标记一个节点待回收
     * @param node 节点
     * @param frame 当前逻辑帧号
     * @param key 预制体目录（回收时用）
     * @param name 预制体名（回收时用）
     */
    public static mark(node: any, frame: number, key: string, name: string): void {
        if (!node) return;
        DeferredNodeRecycler.pending.set(node, { frame, key, name });
    }

    /**
     * @description 推进回收
     * @param frame 当前逻辑帧号
     */
    public static update(frame: number): void {
        if (DeferredNodeRecycler.pending.size === 0) return;

        const expired: any[] = [];
        DeferredNodeRecycler.pending.forEach((rec, node) => {
            if (frame - rec.frame >= DeferredNodeRecycler.rollbackWindowFrames) {
                expired.push(node);
            }
        });

        for (let i = 0; i < expired.length; i++) {
            const node = expired[i];
            const rec = DeferredNodeRecycler.pending.get(node);
            DeferredNodeRecycler.pending.delete(node);
            if (!node || !node.isValid) continue;

            if (rec) {
                // 入池复用（比 instantiate 便宜得多）
                resBridge.recycle(rec.key, rec.name, node);
            } else {
                node.destroy();
            }
        }
    }

    /**
     * 撤销一个待回收标记（回滚复活时调用）
     * @param node 节点
     */
    public static unmark(node: any): void {
        if (!node) return;
        DeferredNodeRecycler.pending.delete(node);
    }

    /**节点是否处于待回收状态*/
    public static isPending(node: any): boolean {
        return DeferredNodeRecycler.pending.has(node);
    }

    /**清空（重开一局时用）*/
    public static clear(): void {
        DeferredNodeRecycler.pending.clear();
    }
}

/**待回收记录*/
interface IPendingNode {
    /**标记时的逻辑帧号*/
    frame: number;
    /**预制体目录*/
    key: string;
    /**预制体名*/
    name: string;
}

/**怪物预制体的回收标识（复用导入，避免循环依赖）*/
export const ENEMY_PREFAB_KEY = PathEnum.Enemy;
export const ENEMY_PREFAB_NAME = UIEnum.Enemy;
