import { Animation, Sprite } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, ViewComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";

export class AnimPlaySystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [AnimComponent, ViewComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        let entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let anim = this.world.getComp(entity, AnimComponent);
            let view = this.world.getComp(entity, ViewComponent);
            let node = view.node;
            if (!node) continue;

            // 1. 状态切换（状态变化 或 isComplete 时重新触发）
            if (anim.nextState !== null && (anim.nextState !== anim.state || anim.isComplete)) {
                anim.state = anim.nextState;
                anim.frameIndex = 0;
                anim.timer = 0;
                anim.isComplete = false;
                anim.currentTrigger = '';
            }
            anim.nextState = null;

            // 2. 获取当前配置
            let config = anim.configs.get(anim.state);
            if (!config) {
                anim.currentTrigger = '';
                continue;
            }

            // 3. 分类型处理（缺省 = sequence）
            if (config.type === 'animation') {
                this.tickAnimation(anim, config, node);
            } else {
                this.tickSequence(anim, config, node, dt);
            }
        }
    }

    /**序列帧：手动切帧 */
    private tickSequence(anim: AnimComponent, config: any, node: any, dt: number) {
        if (!config.frames || config.frames.length === 0) {
            anim.currentTrigger = '';
            if (!config.loop) anim.isComplete = true;
            return;
        }
        // 切状态后立即显示第一帧（停止 Animation 组件避免抢夺 Sprite）
        if (anim.timer === 0 && anim.frameIndex === 0 && config.frames.length > 0) {
            let animation = node.getComponent(Animation);
            if (animation) animation.stop();
            let sprite = node.getComponent(Sprite);
            if (!sprite) sprite = node.addComponent(Sprite);
            sprite.spriteFrame = config.frames[0];
        }

        anim.timer += dt;
        if (anim.timer < config.interval) return;

        anim.timer -= config.interval;

        // 帧事件
        anim.currentTrigger = config.events?.[anim.frameIndex] ?? '';

        // 停止 Animation，设 SpriteFrame
        let animation = node.getComponent(Animation);
        if (animation) animation.stop();
        let sprite = node.getComponent(Sprite);
        if (!sprite) sprite = node.addComponent(Sprite);
        sprite.spriteFrame = config.frames[anim.frameIndex];

        // 推进
        anim.frameIndex++;
        if (anim.frameIndex >= config.frames.length) {
            if (config.loop) {
                anim.frameIndex = 0;
            } else {
                anim.isComplete = true;
                anim.frameIndex = config.frames.length - 1;
            }
        }
    }

    /**Cocos .anim 动画：引擎自动驱动 */
    private tickAnimation(anim: AnimComponent, config: any, node: any) {
        let animation = node.getComponent(Animation);
        if (!animation) animation = node.addComponent(Animation);

        if (config.clip) {
            let clipName = config.clip.name;
            if (!animation.getState(clipName) || !animation.getState(clipName).isPlaying) {
                animation.play(clipName);
                if (!config.loop) {
                    animation.getState(clipName).wrapMode = 1; // Normal (play once)
                }
            }
        }

        // 没有事件机制，需要用户自行在 .anim 文件里加帧事件
        anim.currentTrigger = '';
        // 通过 Animation 状态判断是否播完（非循环时）
        if (!config.loop && config.clip) {
            let state = animation.getState(config.clip.name);
            if (state && state.isPlaying === false) {
                anim.isComplete = true;
            }
        }
    }
}