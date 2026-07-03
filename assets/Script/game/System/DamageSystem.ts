import { Color, Sprite, Vec3 } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { DamageComponent } from "../Component/DamageComponent";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { HitCooldownComponent } from "../Component/HitCooldownComponent";
import { ComponentClass } from "../tool/ComponentManager";

export class DamageSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [];

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        let dealers = this.world.query(DamageComponent, PosComponent);
        let targets = this.world.query(HealthComponent, PosComponent);

        for (let dealer of dealers) {
            let dealerDmg = this.world.getComp(dealer, DamageComponent);
            let dealerPos = this.world.getComp(dealer, PosComponent);
            let dealerAnim = this.world.getComp(dealer, AnimComponent);

            const isBullet = this.world.hasComp(dealer, BulletComponent);
            const isEnemy = this.world.hasComp(dealer, EnemyAIComponent);

            for (let target of targets) {
                if (dealer === target) continue;

                let targetHp = this.world.getComp(target, HealthComponent);
                if (targetHp.health <= 0) continue;
                let targetPos = this.world.getComp(target, PosComponent);
                let targetAnim = this.world.getComp(target, AnimComponent);

                // 子弹打怪物
                if (isBullet && this.world.hasComp(target, EnemyAIComponent)) {
                    if (dealerAnim && dealerAnim.state === IState.Explode) continue;
                    let dist = Vec3.distance(dealerPos.pos, targetPos.pos);
                    if (dist <= DamageComponent.DEFAULT_RADIUS) {
                        targetHp.health -= dealerDmg.damage;
                        targetHp.flashTimer = 0.15;
                        let targetView = this.world.getComp(target, ViewComponent);
                        if (targetView && targetView.node) {
                            let sprite = targetView.node.getComponent(Sprite);
                            if (sprite) sprite.color = Color.RED;
                        }
                        if (dealerAnim) dealerAnim.nextState = IState.Explode;
                        let dealerVel = this.world.getComp(dealer, VelocityComponent);
                        if (dealerVel) dealerVel.speed = 0;
                    }
                }

                // 怪物攻击玩家
                if (isEnemy && this.world.hasComp(target, PlayerInputComponent)) {
                    let enemyComp = this.world.getComp(dealer, EnemyComponent);
                    let cooldown = this.world.getComp(dealer, HitCooldownComponent);
                    if (cooldown) {
                        cooldown.timer += dt;
                        if (cooldown.timer < cooldown.cooldown) continue;
                        cooldown.timer = 0;
                    }
                    let range = enemyComp ? enemyComp.attackRange : 80;
                    let dist = Vec3.distance(dealerPos.pos, targetPos.pos);
                    if (dist <= range) {
                        targetHp.health -= dealerDmg.damage;
                        if (targetAnim) targetAnim.nextState = IState.GetAttack;
                    }
                }
            }
        }

        // 受击闪红恢复
        let hittables = this.world.query(HealthComponent, ViewComponent);
        for (let id of hittables) {
            let hp = this.world.getComp(id, HealthComponent);
            if (hp.flashTimer > 0) {
                hp.flashTimer -= dt;
                if (hp.flashTimer <= 0) {
                    let view = this.world.getComp(id, ViewComponent);
                    if (view && view.node) {
                        let sprite = view.node.getComponent(Sprite);
                        if (sprite) sprite.color = Color.WHITE;
                    }
                }
            }
        }
    }
}