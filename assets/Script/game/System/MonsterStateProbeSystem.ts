import { Node, director } from "cc";
import { ISystem } from "../Base/ISystem";
import { MONSTER_STATE_NAME, MonsterStateStats } from "../Config/MonsterState";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 怪物状态探针（优先级 1002）
 *
 * 在指定帧把"各状态被进入的次数"和"当前各状态存活数"写进一个节点名，
 * 这样"怪物四态是不是都真的会走到"就能被自动断言，而不是靠肉眼盯。
 *
 * 期望结果：Idle / Move / Attack / Hit / Dead 五个计数都大于 0。
 * 只要有一个是 0，就说明某个状态没有可达路径。
 */
export class MonsterStateProbeSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**是否启用探针（由 BATTLE_CONFIG.verifyMode 统一控制）*/
    public static enabled: boolean = false;
    /**在第几帧输出（相对开局）*/
    public static probeFrame: number = 600;

    private done: boolean = false;

    init(): void {
        this.enable = MonsterStateProbeSystem.enabled;
        this.done = false;
    }

    update(dt: number): void {
        if (!this.enable || this.done) return;
        if (this.world.frame < MonsterStateProbeSystem.probeFrame) return;
        this.done = true;

        const enter = MonsterStateStats.enterCount;
        const alive = MonsterStateStats.aliveCount;
        let parts: string[] = [];
        for (let i = 0; i < enter.length; i++) {
            parts.push(`${MONSTER_STATE_NAME[i]}=${enter[i]}/${alive[i]}`);
        }
        // 四个状态是否都走到过（Dead 必须是 0 以外，即至少死过一只）
        const allReached = enter[0] > 0 && enter[1] > 0 && enter[2] > 0 && enter[3] > 0 && enter[4] > 0;

        const scene = director.getScene();
        if (!scene) return;
        const canvas = scene.getChildByName("Canvas");
        if (!canvas) return;
        const guide = canvas.getChildByName("GuideLayer");
        if (!guide) return;
        const node = new Node(`MSTATE#${allReached ? "ALL4" : "MISSING"}#${parts.join(",")}`);
        node.parent = guide;
        console.log(`[怪物状态探针] ${allReached ? "四态全部覆盖" : "有状态未覆盖"}：${parts.join(",")}`);
    }
}
