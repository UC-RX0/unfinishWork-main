import { Node, director } from "cc";
import { ISystem } from "../Base/ISystem";
import { IWorld } from "../Base/IWorld";
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

    /**探针节点：创建时就把校验和写进节点名，之后不再改名*/
    public static probeNode: Node = null;
    /**开局后第几帧输出一次结果*/
    public static probeFrame: number = 360;
    /**最近一次的校验和（十六进制）*/
    public static lastHex: string = "";
    /**每隔多少帧向外上报一次校验和（联机时用于服务端对比）*/
    public static reportInterval: number = 30;
    /**上报回调，由网络层挂接*/
    public static onChecksum: (frame: number, hex: string) => void = null;
    /**
     * 每帧的校验和回调：(帧号, 校验和)。
     *
     * 【为什么需要它】
     *   预测模式下，客户端会跑到服务端前面去。
     *   当前帧的状态里可能含有【还没被服务端确认】的预测输入，
     *   这时的校验和是"临时值"，拿去和别的客户端比对必然出错。
     *
     *   所以校验和要按帧号存下来，等这一帧的输入全部被确认后，
     *   再取出来上报 —— 那才是"已结算"的校验和。
     */
    public static onFrameChecksum: (frame: number, hex: string) => void = null;

    /**复用的哈希器，避免每帧分配*/
    private static _sum: Checksum = new Checksum();

    /**开局帧号基线，用于把服务端的大帧号折算成"开局第几帧"*/
    private baseFrame: number = -1;
    /**探针是否已输出过，保证只写一次*/
    private probeDone: boolean = false;

    init(): void {
        this.enable = true;
        this.baseFrame = -1;
        this.probeDone = false;
    }

    /**
     * @description 计算当前世界状态的校验和
     * 抽成静态方法，回滚验证要用它在"同一帧"上取两个值做对比。
     */
    public static compute(world: IWorld): { hex: string; count: number } {
        const sum = ChecksumSystem._sum;
        sum.reset();

        // 组件遍历顺序 = entitySignature 的插入顺序，只要逻辑一致就必然一致
        const ids = world.query(PosComponent);
        let count = 0;
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const pos = world.getComp(id, PosComponent);

            sum.pushInt(id);
            sum.pushFloat(pos.pos.x);
            sum.pushFloat(pos.pos.y);

            const hp = world.getComp(id, HealthComponent);
            if (hp) sum.pushFloat(hp.health);

            const vel = world.getComp(id, VelocityComponent);
            if (vel) {
                sum.pushFloat(vel.speed);
                sum.pushFloat(vel.direction.x);
                sum.pushFloat(vel.direction.y);
            }

            const st = world.getComp(id, MonsterStateComponent);
            if (st) {
                sum.pushInt(st.state);
                sum.pushInt(st.enterFrame);
            }
            count++;
        }
        // 实体总数也要纳入，否则"漏掉一个实体"这种差异可能被哈希掩盖
        sum.pushInt(count);

        return { hex: sum.hex, count };
    }

    update(dt: number): void {
        const frame = this.world.frame;
        // 联机时帧号由服务端分配，可能从几千开始，
        // 探针要按"开局第几帧"触发，所以这里记一个基线
        if (this.baseFrame < 0) this.baseFrame = frame - 1;
        const localFrame = frame - this.baseFrame;

        const result = ChecksumSystem.compute(this.world);

        // 每帧的校验和按帧号交给回滚控制器存档。
        // 它要等这一帧的输入全部被服务端确认后，才认为这一帧"已结算"。
        if (ChecksumSystem.onFrameChecksum) {
            ChecksumSystem.onFrameChecksum(frame, result.hex);
        }

        // 用 >= 加一次性标记，而不是精确等于：
        // 万一某帧因等待/追帧被跳过，精确相等会永远错过触发点
        if (!this.probeDone && localFrame >= ChecksumSystem.probeFrame) {
            this.probeDone = true;
            ChecksumSystem.lastHex = result.hex;
            this.createProbe(`DET#local=${localFrame}/frame=${frame}#sum=${result.hex}#count=${result.count}`);
        }
    }

    /**
     * 创建探针节点。
     * 把结果直接写进【创建时的名字】，之后不再依赖改名 —— 改名这条路径在
     * 联机模式下出现过写不进去的情况，而"创建即带名字"没有这个风险。
     */
    private createProbe(name: string): Node {
        if (ChecksumSystem.probeNode) return ChecksumSystem.probeNode;
        const scene = director.getScene();
        if (!scene) return null;
        const canvas = scene.getChildByName("Canvas");
        if (!canvas) return null;
        const guide = canvas.getChildByName("GuideLayer");
        if (!guide) return null;
        const node = new Node(name);
        node.parent = guide;
        ChecksumSystem.probeNode = node;
        return node;
    }

    /**基线帧号也属于系统私有状态，参与快照*/
    public captureState(): any {
        return { baseFrame: this.baseFrame, probeDone: this.probeDone };
    }

    public restoreState(data: any): void {
        if (!data) return;
        this.baseFrame = data.baseFrame;
        this.probeDone = data.probeDone;
    }
}
