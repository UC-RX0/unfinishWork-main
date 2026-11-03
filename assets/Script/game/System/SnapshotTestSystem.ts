import { Node, director } from "cc";
import { ISystem } from "../Base/ISystem";
import { ChecksumSystem } from "./ChecksumSystem";
import { IWorldSnapshot } from "../tool/Snapshot";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 快照往返自检（优先级 1001，最后执行）
 *
 * 验证逻辑世界的快照是否【无损】：
 *   第 captureFrame 帧  → 存快照
 *   第 verifyFrame 帧   → 记下校验和 C1
 *                       → 还原快照（世界回到 captureFrame）
 *                       → 用同样的输入重演到 verifyFrame，记下校验和 C2
 *   C1 === C2 → 快照无损，回滚的前提成立
 *
 * 这是回滚机制的地基测试：如果快照丢了任何一份逻辑状态（组件字段、
 * 实体顺序、刷怪计时、随机数种子），重演结果就会和原来不一样，测试立刻失败。
 *
 * 默认关闭，验证时用 SnapshotTestSystem.enabled = true 打开。
 */
export class SnapshotTestSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**
     * 是否启用自检。
     * 默认关闭：自检会把世界倒带重演，视觉上表现为"怪物突然消失又出现"，
     * 会干扰正常游玩。需要验证时手动改成 true 再跑一次即可。
     */
    public static enabled: boolean = false;
    /**在哪一帧存快照*/
    public static captureFrame: number = 200;
    /**在哪一帧比对校验和*/
    public static verifyFrame: number = 260;

    private snapshot: IWorldSnapshot = null;
    /**0=未开始 1=已还原待重演 2=已完成比对*/
    private phase: number = 0;
    private c1: string = "";
    private c2: string = "";

    init(): void {
        // 联机模式下禁用手工自检：那时世界由回滚控制器接管，两套还原逻辑会互相打架
        this.enable = SnapshotTestSystem.enabled && !this.world.networkMode;
    }

    update(dt: number): void {
        if (!this.enable) return;
        const frame = this.world.frame;

        if (this.phase === 0 && frame === SnapshotTestSystem.captureFrame) {
            this.snapshot = this.world.captureSnapshot();
            console.log(`[快照自检] 已在第 ${frame} 帧存快照`);
            return;
        }

        if (this.phase === 0 && frame === SnapshotTestSystem.verifyFrame) {
            this.c1 = ChecksumSystem.compute(this.world).hex;
            // 还原后世界帧号回到 captureFrame，接下来几帧就是"重演"
            this.world.restoreSnapshot(this.snapshot);
            this.phase = 1;
            console.log(`[快照自检] 第 ${frame} 帧 C1=${this.c1}，已还原快照，开始重演`);
            return;
        }

        if (this.phase === 1 && frame === SnapshotTestSystem.verifyFrame) {
            this.c2 = ChecksumSystem.compute(this.world).hex;
            this.phase = 2;
            const pass = this.c1 === this.c2;
            console.log(`[快照自检] C1=${this.c1} C2=${this.c2} → ${pass ? "通过" : "失败"}`);
            this.report(pass);
        }
    }

    /**把结果写进节点名，方便外部读取*/
    private report(pass: boolean): void {
        const scene = director.getScene();
        if (!scene) return;
        const canvas = scene.getChildByName("Canvas");
        if (!canvas) return;
        const guide = canvas.getChildByName("GuideLayer");
        if (!guide) return;
        const node = new Node(`SNAPSHOT#${pass ? "PASS" : "FAIL"}#c1=${this.c1}#c2=${this.c2}`);
        node.parent = guide;
    }
}
