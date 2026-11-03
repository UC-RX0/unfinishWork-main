import { Node, director } from "cc";
import { ISystem } from "../Base/ISystem";
import { ComponentClass } from "../tool/ComponentManager";
import { HealthComponent, PosComponent, VelocityComponent } from "../Component";
import { BATTLE_CONFIG } from "../Config/BattleConfig";

/**
 * @description 运行时断言 / 玩法测试脚本（优先级 1003，全部之后）
 *
 * 单元测试管的是"函数算得对不对"，这个管的是"跑起来之后世界有没有变得不合法"。
 * 两者的区别很关键：肉眼看画面永远发现不了"坐标悄悄漂了 3 像素"，
 * 但这类偏差在帧同步里会一路放大到分叉。
 *
 * 检查的是【不变量】：任何一帧都必须成立的事情。
 *   1. 实体位置不能跑到战场外（越界往往意味着速度/方向算错了）
 *   2. 血量不能为负，也不能超过上限（伤害结算重复或穿透）
 *   3. 速度方向必须是单位向量或零向量（没归一化会让速度失控）
 *   4. 实体数量不能无限增长（漏 removeEntity 会内存泄漏 + 越跑越卡）
 *
 * 用法：
 *   1. World.addBase() 里已经有 new GameTestRunner() 的注册（见文件末尾说明）
 *   2. 需要验证时设 GameTestRunner.enabled = true
 *   3. 结果看 console 的 [断言] 前缀，或读 GuideLayer 下的 ASSERT# 节点名
 *
 * 之所以每 checkInterval 帧才查一次：这些东西的物理性质是"一旦坏就一直是坏的"，
 * 没必要每帧扫全表，60 帧一次足够早发现，也不影响性能。
 */
export class GameTestRunner extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**总开关。默认关闭，验证时打开*/
    public static enabled: boolean = false;
    /**每多少帧检查一次*/
    public static checkInterval: number = 60;
    /**实体数量上限（超过就认为有泄漏）*/
    public static maxEntityCount: number = 500;

    /**累计违规次数（静态，方便 headless 测试直接读取）*/
    public static violations: number = 0;
    /**已输出过的违规指纹，避免同一条刷屏*/
    private seen: { [key: string]: boolean } = {};
    /**探针节点*/
    private probe: Node = null;

    init(): void {
        this.enable = GameTestRunner.enabled;
        GameTestRunner.violations = 0;
        this.seen = {};
    }

    update(dt: number): void {
        if (!this.enable) return;
        const frame = this.world.frame;
        if (frame % GameTestRunner.checkInterval !== 0) return;

        this.checkPositionBounds(frame);
        this.checkHealth(frame);
        this.checkVelocity(frame);
        this.checkEntityCount(frame);

        if (GameTestRunner.violations > 0) {
            this.flushProbe();
        }
    }

    //#region 不变量检查
    /**位置必须落在战场内（战场尺寸来自 BATTLE_CONFIG，不读 Canvas）*/
    private checkPositionBounds(frame: number): void {
        const halfW = BATTLE_CONFIG.fieldHalfWidth;
        const halfH = BATTLE_CONFIG.fieldHalfHeight;
        // 留一点余量：刷怪会在边界外生成，追击时也可能短暂越界
        const slack = 200;

        const ids = this.world.query(PosComponent);
        for (let i = 0; i < ids.length; i++) {
            const pos = this.world.getComp(ids[i], PosComponent);
            if (!pos) continue;
            const x = pos.pos.x;
            const y = pos.pos.y;
            if (!isFinite(x) || !isFinite(y)) {
                this.fail(frame, `POS_NAN#${ids[i]}`, `实体 ${ids[i]} 位置为 NaN/Infinity（${x}, ${y}）`);
                continue;
            }
            if (Math.abs(x) > halfW + slack || Math.abs(y) > halfH + slack) {
                this.fail(frame, `POS_OOB#${ids[i]}`, `实体 ${ids[i]} 跑出战场：(${x.toFixed(1)}, ${y.toFixed(1)})`);
            }
        }
    }

    /**血量不能为负，也不能超过初始上限*/
    private checkHealth(frame: number): void {
        const ids = this.world.query(HealthComponent);
        for (let i = 0; i < ids.length; i++) {
            const hp = this.world.getComp(ids[i], HealthComponent);
            if (!hp) continue;
            if (hp.health < 0) {
                this.fail(frame, `HP_NEG#${ids[i]}`, `实体 ${ids[i]} 血量为负：${hp.health}（伤害结算可能重复）`);
            }
            if (!isFinite(hp.health)) {
                this.fail(frame, `HP_NAN#${ids[i]}`, `实体 ${ids[i]} 血量非法：${hp.health}`);
            }
            if (hp.maxHealth > 0 && hp.health > hp.maxHealth) {
                this.fail(frame, `HP_OVER#${ids[i]}`, `实体 ${ids[i]} 血量 ${hp.health} 超过上限 ${hp.maxHealth}（治疗结算可能重复）`);
            }
        }
    }

    /**速度方向必须是单位向量或零向量（未归一化会让移动速度失控）*/
    private checkVelocity(frame: number): void {
        const ids = this.world.query(VelocityComponent);
        for (let i = 0; i < ids.length; i++) {
            const vel = this.world.getComp(ids[i], VelocityComponent);
            if (!vel) continue;
            const lenSq = vel.direction.x * vel.direction.x + vel.direction.y * vel.direction.y;
            // 0 = 静止，1 = 单位向量。
            //
            // 【容差为什么是 1e-2 而不是 1e-3】
            //   输入方向是【定点整数】（×1000 取整），还原回浮点后必然有量化误差。
            //   实测最坏情况 |v|² = 1.0010 —— 0.1% 的误差，是定点量化的固有精度。
            //   用 1e-3 的容差会把正常的量化误差判成违规。
            //   1e-2 仍然能抓住真正的 bug（未归一化的向量 |v|² 会偏离 1 很多）。
            if (lenSq > 1e-3 && Math.abs(lenSq - 1) > 1e-2) {
                this.fail(
                    frame,
                    `VEL_UNNORMALIZED#${ids[i]}`,
                    `实体 ${ids[i]} 方向未归一化：(${vel.direction.x}, ${vel.direction.y})，|v|²=${lenSq.toFixed(4)}`
                );
            }
        }
    }

    /**实体数量异常增长 = 漏 removeEntity*/
    private checkEntityCount(frame: number): void {
        const count = this.world.query(PosComponent).length;
        if (count > GameTestRunner.maxEntityCount) {
            this.fail(frame, `ENTITY_LEAK`, `实体数 ${count} 超过上限 ${GameTestRunner.maxEntityCount}（疑似漏 removeEntity）`);
        }
    }
    //#endregion

    //#region 报告
    /**
     * 记录一次违规。
     * key 只用来去重，同一类问题同一实体只报一次，避免 60 帧刷 60 条。
     */
    private fail(frame: number, key: string, message: string): void {
        GameTestRunner.violations++;
        if (this.seen[key]) return;
        this.seen[key] = true;
        console.error(`[断言失败] frame=${frame} ${message}`);
    }

    /**把汇总写进节点名 —— 现有外部工具（MCP / 自动化）读节点比读日志可靠*/
    private flushProbe(): void {
        const label = `ASSERT#FAIL#${GameTestRunner.violations}#frame=${this.world.frame}`;
        if (this.probe && this.probe.isValid) {
            this.probe.name = label;
            return;
        }
        const scene = director.getScene();
        if (!scene) return;
        const canvas = scene.getChildByName("Canvas");
        if (!canvas) return;
        const guide = canvas.getChildByName("GuideLayer");
        if (!guide) return;
        this.probe = new Node(label);
        this.probe.parent = guide;
        console.error(`[断言] 共 ${GameTestRunner.violations} 次违规，详情见上方日志`);
    }
    //#endregion
}
