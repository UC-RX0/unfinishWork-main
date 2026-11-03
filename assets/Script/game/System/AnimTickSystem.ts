import { ISystem } from "../Base/ISystem";
import { AnimComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 动画推进（优先级 140，逻辑段）
 *
 * 从原 AnimPlaySystem 里拆出来的"纯逻辑"那一半：
 *   只推进 frameIndex / timer / currentTrigger / isComplete，一个节点都不碰。
 *
 * 为什么要拆：
 *   原来一个系统同时干"推进帧索引"和"给 Sprite 换图"，
 *   导致逻辑帧和渲染帧被绑死 —— 逻辑帧率降不下去，也没法插值、没法回滚。
 *   拆开之后：逻辑只认帧号，渲染自己决定这一帧该怎么画。
 *
 * clip 类动画（.anim）不走这里：它的时间轴由引擎掌握，本系统不推进，
 * 由 AnimRenderSystem 轮询播放状态回写 isComplete。
 */
export class AnimTickSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [AnimComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const entities = this.world.query(...this.requiredComponents);
        for (let i = 0; i < entities.length; i++) {
            const anim = this.world.getComp(entities[i], AnimComponent);

            // 1. 状态切换：nextState 生效并重置播放进度
            if (anim.nextState !== null && (anim.nextState !== anim.state || anim.isComplete)) {
                anim.state = anim.nextState;
                anim.frameIndex = 0;
                anim.timer = 0;
                anim.isComplete = false;
                anim.currentTrigger = '';
            }
            anim.nextState = null;

            // 2. 没有对应配置就什么都不做
            const config = anim.configs.get(anim.state);
            if (!config) {
                anim.currentTrigger = '';
                continue;
            }

            // 3. clip 动画由引擎驱动，这里只清掉帧事件
            if (config.type === 'animation') {
                anim.currentTrigger = '';
                continue;
            }

            this.tickSequence(anim, config, dt);
        }
    }

    /**序列帧：按固定步长推进下标*/
    private tickSequence(anim: AnimComponent, config: any, dt: number): void {
        const frames = config.frames;
        if (!frames || frames.length === 0) {
            anim.currentTrigger = '';
            if (!config.loop) anim.isComplete = true;
            return;
        }

        // 非循环且已播完 → 停在最后一帧，不再推进
        if (!config.loop && anim.isComplete) return;

        // interval 为 0 会导致死循环，兜一个极大值
        const interval = config.interval > 0 ? config.interval : 1e9;
        anim.timer += dt;

        // 用 while 而不是 if：固定步长下偶尔一个逻辑帧会跨过多个动画帧，
        // 只 if 一次会漏帧，动画看起来会"掉帧"
        let guard = 0;
        while (anim.timer >= interval && guard < 8) {
            anim.timer -= interval;

            // 先取当前帧的事件，再推进下标（与原实现一致）
            anim.currentTrigger = (config.events && config.events[anim.frameIndex]) || '';

            anim.frameIndex++;
            if (anim.frameIndex >= frames.length) {
                if (config.loop) {
                    anim.frameIndex = 0;
                } else {
                    anim.frameIndex = frames.length - 1;
                    anim.isComplete = true;
                    break;
                }
            }
            guard++;
        }
    }
}
