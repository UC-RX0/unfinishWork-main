import { BATTLE_CONFIG } from "./Config/BattleConfig";
import { logicRng } from "./Math/PRNG";
import { createBattleDirector, createPlayers } from "./SceneBuilder";
import { world } from "./World";
import { IWorld } from "./Base/IWorld";
import { ViewComponent } from "./Component";

/**
 * @description 对局会话管理
 *
 * 负责"开一局 / 重开一局"这种【不在帧同步模拟内部】的操作。
 *
 * 为什么单独抽出来：
 *   重开会销毁并重建全部实体，这是个大动作，绝不能发生在逻辑帧中间 ——
 *   那样会撕裂正在跑的模拟。集中到这里，由 UI 层在安全的时机调用。
 *
 * 重开的完整步骤（顺序不能错）：
 *   1. 清空实体（节点也要销毁，否则场景里会堆一堆残留）
 *   2. 重置随机源 —— 不重置的话第二局的随机序列会接着第一局走
 *   3. 重置世界（帧号、时钟、各管理器）
 *   4. 重建导演与玩家实体
 */
export class GameSession {
    private constructor() { }
    private static _instance: GameSession = null;
    public static get instance(): GameSession {
        if (!GameSession._instance) GameSession._instance = new GameSession();
        return GameSession._instance;
    }

    /**是否正在重开（防止一帧内被多次点击触发）*/
    private restarting: boolean = false;

    /**
     * @description 开一局
     * @param w 世界实例
     * @param playerCount 玩家数量
     * @param seed 随机种子（联机时由服务端下发）
     */
    public start(w: IWorld, playerCount: number, seed: number = BATTLE_CONFIG.randomSeed): void {
        logicRng.restore(seed);
        w.init();
        this.buildEntities(w, playerCount);
    }

    /**
     * @description 重开一局
     *
     * 单机：直接重建。
     * 联机：必须由服务端广播统一重开指令，各端同时重置 ——
     *       否则各端的随机序列和帧号会错位，必然分叉。
     */
    public restart(w: IWorld, playerCount: number, seed: number = BATTLE_CONFIG.randomSeed): void {
        if (this.restarting) return;
        this.restarting = true;

        try {
            this.clearEntities(w);
            logicRng.restore(seed);
            w.init();
            this.buildEntities(w, playerCount);
            console.log(`[GameSession] 已重开一局（seed=${seed}）`);
        } finally {
            this.restarting = false;
        }
    }

    /**
     * @description 销毁全部实体
     *
     * 注意：只 removeEntityById 是不够的 —— 实体的 ViewComponent 持有的节点
     * 还挂在场景里，不销毁的话重开几次场景就堆满了僵尸怪物。
     */
    private clearEntities(w: IWorld): void {
        // 先收集所有实体 id（removeEntity 会改变池状态，边遍历边删不安全）
        const ids = w.getAllEntityIds();

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const view = w.getComp(id, ViewComponent);
            if (view && view.node && view.node.isValid) {
                view.node.destroy();
            }
            w.removeEntityById(id);
        }
    }

    /**重建导演与玩家*/
    private buildEntities(w: IWorld, playerCount: number): void {
        createBattleDirector(w);
        createPlayers(w, playerCount);
    }
}

export const gameSession = GameSession.instance;
