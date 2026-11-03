
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, HealthComponent, PlayerInputComponent, PosComponent, VelocityComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { lengthSq } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";
//  移动系统
//  优先值低于InputSystem
//  需要输入系统完成后再执行操作
export class MoveSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [PosComponent, VelocityComponent];
    //会在初始化的时候去查询所有需要的组件类
    //或者看World 是否会带有数据注入的方法
    //有待后续讨论实现
    init() {
        //初始化系统
        this.enable = true;
    }
    //开启或关闭系统
    update(dt: number) {
        //根据速度和方向更新位置
        let entityId = this.world.query(...this.requiredComponents);
        // console.log("MoveSystem update entityId", entityId);
        for (let id of entityId) {
            let posComponent = this.world.getComp(id, PosComponent);
            let velocityComponent = this.world.getComp(id, VelocityComponent);
            let anim = this.world.getComp(id, AnimComponent);
            let isBullet = this.world.hasComp(id, BulletComponent);
            let health = this.world.getComp(id, HealthComponent);
            let isDead = health && health.health <= 0;
            // 怪物有独立的状态机，动画状态不再由这里推
            let isMonster = this.world.hasComp(id, MonsterStateComponent);
            if (!isMonster && anim && !isBullet && !isDead && anim.nextState === null && anim.state !== IState.Attack) {
                if (lengthSq(velocityComponent.direction.x, velocityComponent.direction.y) > 0.01) {
                    anim.nextState = IState.Walk;
                }
                else {
                    anim.nextState = IState.Idle;
                }
            }
            if (posComponent && velocityComponent) {
                posComponent.pos.y += velocityComponent.direction.y * velocityComponent.speed * dt;
                posComponent.pos.x += velocityComponent.direction.x * velocityComponent.speed * dt;

                // 玩家被限制在战场内。
                // 不限制的话玩家能跑出战场（画面之外就看不见自己了），
                // 也会破坏位置不变量。
                //
                // 边界来自 BATTLE_CONFIG 而不是 Canvas —— 逻辑读视图是帧同步的大忌。
                if (this.world.hasComp(id, PlayerInputComponent)) {
                    const halfW = BATTLE_CONFIG.fieldHalfWidth;
                    const halfH = BATTLE_CONFIG.fieldHalfHeight;
                    if (posComponent.pos.x > halfW) posComponent.pos.x = halfW;
                    else if (posComponent.pos.x < -halfW) posComponent.pos.x = -halfW;
                    if (posComponent.pos.y > halfH) posComponent.pos.y = halfH;
                    else if (posComponent.pos.y < -halfH) posComponent.pos.y = -halfH;
                }
            }
        }
    }
}
