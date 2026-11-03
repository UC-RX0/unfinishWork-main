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
    /**每隔多少帧向外上报一次校验和（联机时用于服务端对比）*/
    public static reportInterval: number = 30;
    /**上报回调，由网络层挂接*/
    public static onChecksum: (frame: number, hex: string) => void = null;

    private sum: Checksum = new Checksum();
    /**开局帧号基线，用于把服务端的大帧号折算成"开局第几帧"*/
    private baseFrame: number = -1;
    /**探针是否已输出过，保证只写一次*/
    private probeDone: boolean = false;

    init(): void {
        this.enable = true;
        this.baseFrame = -1;
        this.probeDone = false;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        // 联机时帧号由服务端分配，可能从几千开始，
        // 探针要按"开局第几帧"触发，所以这里记一个基线
        if (this.baseFrame < 0) this.baseFrame = frame - 1;
        const localFrame = frame - this.baseFrame;

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

        // 用 >= 加一次性标记，而不是精确等于：
        // 万一某帧因等待/追帧被跳过，精确相等会永远错过触发点
        if (!this.probeDone && localFrame >= ChecksumSystem.probeFrame) {
            this.probeDone = true;
            ChecksumSystem.lastHex = sum.hex;
            if (ChecksumSystem.probeNode) {
                ChecksumSystem.probeNode.name = `DET#local=${localFrame}/frame=${frame}#sum=${sum.hex}#count=${count}`;
            }
        }

        // 联机时定期上报，服务端负责跨客户端比对，不一致就广播 desync
        if (ChecksumSystem.onChecksum && ChecksumSystem.reportInterval > 0
            && frame % ChecksumSystem.reportInterval === 0) {
            ChecksumSystem.onChecksum(frame, sum.hex);
        }
    }
}
