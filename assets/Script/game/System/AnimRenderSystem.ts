import { Animation, Sprite } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, ViewComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 动画渲染（优先级 500，渲染段）
 *
 * 原 AnimPlaySystem 的"渲染"那一半：只负责把逻辑层算好的 frameIndex 落到画面上。
 * 它不推进任何逻辑状态（唯一的例外是 clip 动画的完成回调，见下方说明）。
 *
 * 性能说明：Sprite.spriteFrame 的 setter 内部会做引用相等判断，
 * 赋同一个 frame 会立即返回，所以这里每帧直接赋值是安全的，不需要额外缓存。
 */
export class AnimRenderSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [AnimComponent, ViewComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const entities = this.world.query(...this.requiredComponents);
        for (let i = 0; i < entities.length; i++) {
            const anim = this.world.getComp(entities[i], AnimComponent);
            const view = this.world.getComp(entities[i], ViewComponent);
            const node = view.node;
            if (!node) continue;

            const config = anim.configs.get(anim.state);
            if (!config) continue;

            const animation = node.getComponent(Animation);

            if (config.type === 'animation') {
                if (animation && !animation.enabled) animation.enabled = true;
                this.renderClip(anim, config, animation);
            } else {
                // 序列帧模式下必须关掉 Animation 组件，否则它会和手动换图抢 Sprite
                if (animation && animation.enabled) animation.enabled = false;
                this.renderSequence(anim, config, node);
            }
        }
    }

    /**序列帧：把逻辑层的 frameIndex 映射成 SpriteFrame*/
    private renderSequence(anim: AnimComponent, config: any, node: any): void {
        const frames = config.frames;
        if (!frames || frames.length === 0) return;

        let sprite = node.getComponent(Sprite);
        if (!sprite) sprite = node.addComponent(Sprite);

        let idx = anim.frameIndex;
        if (idx < 0) idx = 0;
        if (idx >= frames.length) idx = frames.length - 1;

        const frame = frames[idx];
        if (sprite.spriteFrame !== frame) {
            sprite.spriteFrame = frame;
        }
    }

    /**
     * clip 动画：交给引擎驱动
     *
     * 注意这里有一处 view → logic 的写回（isComplete）。
     * 这是刻意保留的：clip 的时间轴归引擎管，逻辑层无法独立推算播放是否结束，
     * 所以只能轮询回写。这也是为什么 clip 动画不适合做"影响玩法时序"的表现，
     * 攻击这类需要精确对齐伤害帧的动画必须用序列帧。
     */
    private renderClip(anim: AnimComponent, config: any, animation: Animation): void {
        if (!animation) return;

        if (config.clip) {
            const clipName = config.clip.name;
            let state = animation.getState(clipName);
            // 原实现直接 play(name)，但 clip 从未被 addClip 进去，play 是空操作。
            // 这里先补上挂载。
            if (!state) {
                animation.addClip(config.clip, clipName);
                state = animation.getState(clipName);
            }
            if (state && !state.isPlaying) {
                animation.play(clipName);
                if (!config.loop) state.wrapMode = 1; // Normal（播一次）
            }
        }

        if (!config.loop && config.clip) {
            const state = animation.getState(config.clip.name);
            if (state && !state.isPlaying) {
                anim.isComplete = true;
            }
        }
    }
}
