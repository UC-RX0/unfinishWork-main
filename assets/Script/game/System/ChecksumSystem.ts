import { Node } from "cc";
import { ISystem } from "../Base/ISystem";
import { HealthComponent, PosComponent, VelocityComponent } from "../Component";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { Checksum } from "../tool/Checksum";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 世界状态校验和（优先级 1000，最后执行）
 *
 * 作用：把整帧的逻辑状态压成一个 32 位哈希。
 * 用它来判断"两次运行是否完全一致" —— 帧同步里这是唯一可靠的验证手段，
 * 肉眼看画面没用，几百帧后的微小偏差肉眼根本看不出来，但校验和会立刻炸。
 *
 * 校验内容只包含逻辑字段（位置/速度/血量/状态），不包含任何渲染数据。
 */
export class ChecksumSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**把结果写到这个节点的名字上，方便外部观测；为空则不输出*/
    public static probeNode: Node = null;
    /**在第几帧输出一次结果*/
    public static probeFrame: number = 360;
    /**最近一次的校验和（十六进制）*/
    public static lastHex: string = "";

    private sum: Checksum = new Checksum();

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        const sum = this.sum;
        sum.reset();

        // 组件遍历顺序 = entitySignature 的插入顺序，只要逻辑一致就必然一致
        const ids = this.world.query(PosComponent);
        let count = 0;
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const pos = this.world.getComp(id, PosComponent);

            sum.pushInt(id);
            sum.pushFloat(pos.pos.x);
            sum.pushFloat(pos.pos.y);

            const hp = this.world.getComp(id, HealthComponent);
            if (hp) sum.pushFloat(hp.health);

            const vel = this.world.getComp(id, VelocityComponent);
            if (vel) {
                sum.pushFloat(vel.speed);
                sum.pushFloat(vel.direction.x);
                sum.pushFloat(vel.direction.y);
            }

            const st = this.world.getComp(id, MonsterStateComponent);
            if (st) {
                sum.pushInt(st.state);
                sum.pushInt(st.enterFrame);
            }
            count++;
        }
        // 实体总数也要纳入，否则"漏掉一个实体"这种差异可能被哈希掩盖
        sum.pushInt(count);

        if (frame === ChecksumSystem.probeFrame) {
            ChecksumSystem.lastHex = sum.hex;
            if (ChecksumSystem.probeNode) {
                // 只写一次，之后不再覆盖，避免外部读到不同帧的值
                ChecksumSystem.probeNode.name = `DET#frame=${frame}#sum=${sum.hex}#count=${count}`;
            }
        }
    }
}
