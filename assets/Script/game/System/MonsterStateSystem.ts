import { ISystem } from "../Base/ISystem";
import { HealthComponent, VelocityComponent } from "../Component";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { MONSTER_VISUAL_CFG, MonsterState, MonsterStateStats } from "../Config/MonsterState";
import { ComponentClass } from "../tool/ComponentManager";

/**
 * @description 怪物状态机（优先级 125）
 *
 * 它是 MonsterStateComponent 的【唯一写入者】。
 * 以前的写法是 MoveSystem / DamageSystem / DeathSystem 都能写 anim.nextState，
 * 靠系统优先级碰巧没出错；现在状态只有这一个出口，加多少系统都不会互相覆盖。
 *
 * 状态推断顺序（后面的覆盖前面的）：
 *   1. 血量 <= 0        → Dead（压倒一切，不可打断）
 *   2. 本帧受击         → Hit（打断 Attack / Move，持续固定帧数）
 *   3. 在攻击范围内     → Attack（播完自动循环，形成连续攻击）
 *   4. 有速度           → Move
 *   5. 其他             → Idle
 */
export class MonsterStateSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [MonsterStateComponent, HealthComponent];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        const entities = this.world.query(...this.requiredComponents);

        // 统计当前各状态的存活数量（调试用）
        for (let i = 0; i < MonsterStateStats.aliveCount.length; i++) {
            MonsterStateStats.aliveCount[i] = 0;
        }

        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const st = this.world.getComp(id, MonsterStateComponent);
            const hp = this.world.getComp(id, HealthComponent);

            // 朝向：只要有方向就记录，停下时保留上一次朝向（攻击冲刺要用）
            const vel = this.world.getComp(id, VelocityComponent);
            if (vel && Math.abs(vel.direction.x) > 0.01) {
                st.facing = vel.direction.x < 0 ? -1 : 1;
            }

            // 1. 死亡压倒一切
            if (hp.health <= 0) {
                this.setState(st, MonsterState.Dead, frame);
                continue;
            }

            // 2. 受击：由 DamageSystem 置位，这里消费掉
            if (hp.hurtThisFrame) {
                hp.hurtThisFrame = false;
                st.hitFramesLeft = MONSTER_VISUAL_CFG.Hit.frames;
            }
            if (st.hitFramesLeft > 0) {
                st.hitFramesLeft--;
                this.setState(st, MonsterState.Hit, frame);
                continue;
            }

            // 3. 攻击范围内 → Attack
            const ai = this.world.getComp(id, EnemyAIComponent);
            const enemy = this.world.getComp(id, EnemyComponent);
            const range = enemy ? enemy.attackRange : 0;
            const inRange = ai && range > 0 && ai.distanceSqToTarget <= range * range;

            MonsterStateStats.aliveCount[st.state]++;

            if (inRange) {
                // 攻击动作播完后自动重来一次，形成连续攻击的观感
                if (st.state === MonsterState.Attack
                    && frame - st.enterFrame >= MONSTER_VISUAL_CFG.Attack.frames) {
                    st.enterFrame = frame;
                }
                this.setState(st, MonsterState.Attack, frame);
                continue;
            }

            // 4/5. 有速度就是移动，否则待机
            const moving = vel && vel.speed > 0.01;
            this.setState(st, moving ? MonsterState.Move : MonsterState.Idle, frame);
        }
    }

    /**切换状态并记录进入帧号；同状态不重置帧龄，避免动画卡在第 0 帧*/
    private setState(st: MonsterStateComponent, next: MonsterState, frame: number): void {
        if (st.state === next) return;
        st.state = next;
        st.enterFrame = frame;
        // 统计各状态被进入的次数，用于自动验证四态是否都覆盖到
        MonsterStateStats.enterCount[next]++;
    }
}
