import { Sprite, SpriteFrame, v2 } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, VelocityComponent, ViewComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";
import { IState } from "../Component/AnimComponent";




export class AnimSyncSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [AnimComponent, ViewComponent, VelocityComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entities = this.world.query(...this.requiredComponents);
        for (let entity of entities) {
            let animComponent = this.world.getComp(entity, AnimComponent);
            let { node } = this.world.getComp(entity, ViewComponent);
            let { direction } = this.world.getComp(entity, VelocityComponent);
            //根据速度方向判断当前动画状态
            if (direction.equals(v2(0, 0))) {
                if (animComponent.state != IState.Idle) {
                    animComponent.state = IState.Idle;
                    animComponent.frameIndex = 0;
                    animComponent.timer = 0;
                }
            } else {
                if (animComponent.state != IState.Walk) {
                    animComponent.state = IState.Walk;
                    animComponent.frameIndex = 0;
                    animComponent.timer = 0;
                }
            }
            animComponent.timer += dt;
            if (animComponent.timer >= animComponent.frameInterval) {
                animComponent.timer -= animComponent.frameInterval;
                animComponent.frameIndex++;
                if (animComponent.frameIndex >= animComponent.frameDatas.get(animComponent.state)!.length) {
                    animComponent.frameIndex = 0;
                }
                const frames: SpriteFrame[] = animComponent.frameDatas.get(animComponent.state);
                if (frames && frames.length > 0) {
                    let sprite = node.getComponent(Sprite);
                    if (!sprite) {
                        sprite = node.addComponent(Sprite);
                    }
                    sprite.spriteFrame = frames[animComponent.frameIndex];
                }
            }

        }
    }


}