import { Vec2 } from "cc";
import { inputMgr } from "../../core/manager/InputManager";
import { ISystem } from "../Base/ISystem";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 脚本输入（优先级 -1，InputSystem 之前）
 *
 * 按固定模式生成输入序列，让整场战斗变成可复现的。
 * 用途：
 *   1. 自动验证射击/命中/怪物受击/死亡这条链路（手动点屏幕没法批量验证）
 *   2. 确定性回放的基础 —— 同样的脚本必然得到同样的校验和
 *   3. 配合回滚控制器做故障注入（故意注入错误输入，验证回滚能纠正）
 *
 * 输入是【帧的纯函数】：同一个帧号一定产出同一份输入，不依赖真实时间和随机数。
 */
export class ScriptedInputSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    /**是否启用脚本输入（由 BATTLE_CONFIG.verifyMode 统一控制）*/
    public static enabled: boolean = false;
    /**脚本模式：none=不干预 / circle=绕圈走 / orbit=走位并持续射击*/
    public static mode: 'none' | 'circle' | 'orbit' = 'orbit';
    /**从第几帧开始射击*/
    public static fireFromFrame: number = 90;
    /**绕圈时每多少帧转一次方向（90 帧 ≈ 1.5 秒）*/
    public static turnInterval: number = 90;

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

        // 方向：绕着原点转圈，让玩家不停靠近和远离怪物
        const seg = Math.floor(frame / ScriptedInputSystem.turnInterval) % 4;
        switch (seg) {
            case 0: this.dir.set(1, 0); break;
            case 1: this.dir.set(0, 1); break;
            case 2: this.dir.set(-1, 0); break;
            default: this.dir.set(0, -1); break;
        }

        // 力度：走一半速度，走走停停更像真人操作
        const strength = (frame % 120 < 60) ? 100 : 40;
        inputMgr.setInput(0, this.dir, strength);

        // 射击：达到起始帧后一直按住
        if (mode === 'orbit' && frame >= ScriptedInputSystem.fireFromFrame) {
            inputMgr.fireDown(0);
        } else {
            inputMgr.fireUp(0);
        }
    }
}
