import { Vec2 } from "cc";
import { inputMgr } from "../../core/manager/InputManager";
import { ISystem } from "../Base/ISystem";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { PlayerInputComponent } from "../Component/PlayerInputComponent";
import { PosComponent } from "../Component/PosComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { distanceSq } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 脚本输入（优先级 -1，InputSystem 之前）
 *
 * 按固定模式生成输入序列，让整场战斗变成可复现的。
 * 用途：
 *   1. 自动验证射击/命中/怪物受击/死亡这条链路（手动点屏幕没法批量验证）
 *   2. 确定性回放的基础 —— 同样的脚本必然得到同样的校验和
 *   3. 配合回滚控制器做故障注入（故意注入错误输入，验证回滚能纠正）
 *   4. 平衡性验证 —— 脚本 AI 打不过去，说明数值有问题
 *
 * 输入是【帧的纯函数】：同一个帧号一定产出同一份输入，不依赖真实时间和随机数。
 *
 * 【为什么 dodge 模式必须会躲】
 *   早期版本用"绕固定圆圈"走位，结果必然被四面包围 —— 因为怪物
 *   从战场四条边刷出来，而玩家只在中心附近转圈。
 *   那不是数值平衡问题，是脚本 AI 太笨。
 *   真实玩家会躲，所以脚本 AI 也必须会躲，
 *   否则测出来的"打不过"是假象。
 */
export class ScriptedInputSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**是否启用脚本输入（由 BATTLE_CONFIG.verifyMode 统一控制）*/
    public static enabled: boolean = false;
    /**脚本模式：none=不干预 / circle=绕圈走 / orbit=绕圈+射击 / dodge=躲避+射击*/
    public static mode: 'none' | 'circle' | 'orbit' | 'dodge' = 'orbit';
    /**从第几帧开始射击*/
    public static fireFromFrame: number = 90;
    /**绕圈时每多少帧转一次方向（90 帧 ≈ 1.5 秒）*/
    public static turnInterval: number = 90;
    /**脚本控制的是哪个玩家（联机时由服务端分配的 playerIndex 决定）*/
    public static localPlayerIndex: number = 0;
    /**躲避模式：距离多近的怪算威胁*/
    public static threatRadius: number = 260;

    /**复用的方向向量，避免每帧分配*/
    private dir: Vec2 = new Vec2();

    init(): void {
        this.enable = ScriptedInputSystem.enabled;
    }

    update(dt: number): void {
        if (!this.enable) return;
        const mode = ScriptedInputSystem.mode;
        if (mode === 'none') return;

        const frame = this.world.frame;
        const me = ScriptedInputSystem.localPlayerIndex;

        if (mode === 'dodge') {
            this.updateDodge(frame, me);
        } else {
            this.updateCircle(frame, me);
        }

        // 射击：达到起始帧后一直按住
        if ((mode === 'orbit' || mode === 'dodge') && frame >= ScriptedInputSystem.fireFromFrame) {
            inputMgr.fireDown(me);
        } else {
            inputMgr.fireUp(me);
        }
    }

    /**绕圈走位：固定的四方轨迹（简单、可复现，用于基础回归）*/
    private updateCircle(frame: number, me: number): void {
        const seg = Math.floor(frame / ScriptedInputSystem.turnInterval) % 4;
        switch (seg) {
            case 0: this.dir.set(1, 0); break;
            case 1: this.dir.set(0, 1); break;
            case 2: this.dir.set(-1, 0); break;
            default: this.dir.set(0, -1); break;
        }

        // 力度：走一半速度，走走停停更像真人操作
        const strength = (frame % 120 < 60) ? 100 : 40;
        inputMgr.setInput(me, this.dir, strength);
    }

    /**
     * @description 躲避走位：远离威胁，靠近场地中心
     *
     * 策略（纯几何，无随机，可复现）：
     *   1. 找最近的怪物
     *   2. 朝远离它的方向跑
     *   3. 同时被场地边界拉回中心（否则会一直贴着边跑）
     *
     * 这个策略模拟的是"会玩的玩家"：不硬拼，边打边退。
     */
    private updateDodge(frame: number, me: number): void {
        // 找自己的位置
        const playerIds = this.world.query(PlayerInputComponent, PosComponent);
        let myPos: PosComponent = null;
        for (let i = 0; i < playerIds.length; i++) {
            const pi = this.world.getComp(playerIds[i], PlayerInputComponent);
            if (pi && pi.playerIndex === me) {
                myPos = this.world.getComp(playerIds[i], PosComponent);
                break;
            }
        }
        if (!myPos) return;

        // 找最近的怪物
        const enemyIds = this.world.query(EnemyComponent, PosComponent);
        let nearest: PosComponent = null;
        let nearestDist = Number.MAX_VALUE;
        for (let i = 0; i < enemyIds.length; i++) {
            const d = distanceSq(myPos.pos.x, myPos.pos.y,
                this.world.getComp(enemyIds[i], PosComponent).pos.x,
                this.world.getComp(enemyIds[i], PosComponent).pos.y);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = this.world.getComp(enemyIds[i], PosComponent);
            }
        }

        let dx = 0;
        let dy = 0;

        if (nearest) {
            // 远离最近的怪物
            const awayX = myPos.pos.x - nearest.pos.x;
            const awayY = myPos.pos.y - nearest.pos.y;
            const lenSq = awayX * awayX + awayY * awayY;
            if (lenSq > 0.0001) {
                const inv = 1 / Math.sqrt(lenSq);
                dx = awayX * inv;
                dy = awayY * inv;
            }
        }

        // 被场地边界拉回中心：越靠近边界，回中心的力越大
        const margin = 220;
        const halfW = BATTLE_CONFIG.fieldHalfWidth;
        const halfH = BATTLE_CONFIG.fieldHalfHeight;
        if (myPos.pos.x > halfW - margin) dx -= (myPos.pos.x - (halfW - margin)) / margin;
        if (myPos.pos.x < -halfW + margin) dx += ((-halfW + margin) - myPos.pos.x) / margin;
        if (myPos.pos.y > halfH - margin) dy -= (myPos.pos.y - (halfH - margin)) / margin;
        if (myPos.pos.y < -halfH + margin) dy += ((-halfH + margin) - myPos.pos.y) / margin;

        // 归一化
        const lenSq = dx * dx + dy * dy;
        if (lenSq > 0.0001) {
            const inv = 1 / Math.sqrt(lenSq);
            this.dir.set(dx * inv, dy * inv);
        } else {
            this.dir.set(0, 0);
        }

        // 力度：离怪越近跑得越快（模拟紧张时的操作）
        const threat = ScriptedInputSystem.threatRadius;
        let strength = 100;
        if (nearest && nearestDist < threat * threat) {
            strength = 100;
        } else {
            strength = 70;
        }
        inputMgr.setInput(me, this.dir, strength);
    }
}
