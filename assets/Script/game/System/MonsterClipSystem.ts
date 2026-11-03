import { Animation } from "cc";
import { ISystem } from "../Base/ISystem";
import { MonsterStateComponent, ViewComponent } from "../Component";
import { MonsterState } from "../Config/MonsterState";
import { ClipEnum } from "../../core/resource/ResEnum";
import { resBridge } from "../../core/resource/ResBridge";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 怪物 clip 动画（优先级 204，渲染段）
 *
 * 把美术做的 .anim 片段接到怪物的状态机上：
 *
 *   Idle  → idle.anim   （缩放呼吸，循环）
 *   Attack→ Attack.anim （前冲 + 膨胀，单次）
 *   Hit   → Heart.anim  （心跳抖动 + 变色，单次）
 *   Move / Dead → 不播 clip（程序化表现已经覆盖，见 MonsterVisualSystem）
 *
 * 关键约束：clip 播在【表现层子节点】上，不是实体根节点。
 * 原因：clip 的 position 轨道是绝对值，播在根节点上会把怪物瞬移到原点
 * （clip 记录的是它被编辑时那个节点的局部坐标）。
 * 播在位于原点的子节点上，clip 的位移就变成了相对根节点的偏移。
 *
 * 状态 → clip 的映射是纯查表，不含任何逻辑判断，
 * 所以这个系统只读状态、不写状态，不可能影响帧同步。
 */
export class MonsterClipSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [MonsterStateComponent, ViewComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const entities = this.world.query(...this.requiredComponents);

        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const st = this.world.getComp(id, MonsterStateComponent);
            const view = this.world.getComp(id, ViewComponent);
            const fx = view.fxNode;
            if (!fx || !fx.isValid) continue;

            const clipName = this.clipFor(st.state);
            if (!clipName) {
                // 没有对应 clip 的状态：停掉当前播放并复位
                this.stopAnimation(fx);
                continue;
            }

            this.playClip(fx, clipName, st.state);
        }
    }

    /**状态 → clip 名称的映射*/
    private clipFor(state: MonsterState): string | null {
        switch (state) {
            case MonsterState.Idle:
                return ClipEnum.EnemyIdle;
            case MonsterState.Attack:
                return ClipEnum.EnemyAttack;
            case MonsterState.Hit:
                return ClipEnum.EnemyHit;
            default:
                return null;
        }
    }

    /**
     * 播放 clip
     * @param fx 表现层子节点
     * @param clipName clip 名称
     * @param state 当前状态（用于决定循环还是单次）
     */
    private playClip(fx: any, clipName: string, state: MonsterState): void {
        let animation: Animation = fx.getComponent(Animation);
        if (!animation) {
            animation = fx.addComponent(Animation);
        }

        // clip 必须先挂进 Animation 才能播 —— 直接 play() 一个没挂过的 clip 是空操作
        let animState = animation.getState(clipName);
        if (!animState) {
            const clip = resBridge.getClip(clipName);
            if (!clip) return;
            animation.addClip(clip, clipName);
            animState = animation.getState(clipName);
            if (!animState) return;
        }

        // Idle 是循环动画，其余是单次
        const loop = state === MonsterState.Idle;

        // 已经在播同一个 clip：单次动画播完就停，循环动画保持
        if (animState.isPlaying) {
            if (!loop) {
                // 单次动画播完会被引擎置为不播放，这里主动复位并重播
                animState.wrapMode = loop ? 2 : 1; // 2 = Loop, 1 = Normal
                animState.play();
            }
            return;
        }

        animState.wrapMode = loop ? 2 : 1;
        animation.play(clipName);
    }

    /**停止并复位动画（状态切到没有 clip 的状态时调用）*/
    private stopAnimation(fx: any): void {
        const animation: Animation = fx.getComponent(Animation);
        if (!animation || !animation.enabled) return;
        animation.enabled = false;
        // 复位变换，否则上一次 clip 留下的缩放/位移会残留
        fx.setPosition(0, 0, 0);
        fx.setScale(1, 1, 1);
    }
}
