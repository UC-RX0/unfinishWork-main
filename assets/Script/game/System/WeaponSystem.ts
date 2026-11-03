import { Node } from "cc";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../../core/manager/UIManager";
import { resBridge } from "../../core/resource/ResBridge";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { IState } from "../Component/AnimComponent";
import { DamageComponent } from "../Component/DamageComponent";
import { BATTLE_CONFIG } from "../Config/BattleConfig";
import { copyVec2, Vec2Like } from "../Math/MathUtil";
import { ComponentClass } from "../tool/ComponentManager";

//优先级90

export class WeaponSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [WeaponComponent, OwnerComponent];

    init(): void {
        this.enable = true;
        // 子弹预制体与序列帧均由 ResBridge 在启动期预加载，
        // 这里不再需要持有 NodePool / 取 Prefab，运行期零异步。
    }

    update(dt: number): void {
        let entitis = this.world.query(...this.requiredComponents);
        for (const entity of entitis) {
            let weaponComponent = this.world.getComp(entity, WeaponComponent);
            let weaponNode = this.world.getComp(entity, ViewComponent).node;
            let { ownerId } = this.world.getComp(entity, OwnerComponent);
            let weaponAnim = this.world.getComp(entity, AnimComponent);

            let playerInput = this.world.getComp(ownerId, PlayerInputComponent);
            if (!playerInput) continue;
            const playerIndex = playerInput.playerIndex;
            if (playerIndex === null || playerIndex === undefined) continue;

            if (!weaponAnim) continue;

            // 攻击完成 → 请求切回 Idle
            if (weaponAnim.isComplete && weaponAnim.state === IState.Attack && weaponAnim.nextState === null) {
                weaponAnim.nextState = IState.Idle;
            }

            // 按射击 → 播放攻击动画（开火信号来自本帧输入，不再直接读 inputMgr）
            const frameInput = this.world.getInput(this.world.frame, playerIndex);
            if (frameInput && frameInput.fire && weaponAnim.state !== IState.Attack) {
                weaponAnim.nextState = IState.Attack;
            }

            // 攻击动画帧事件 → 发射子弹
            if (weaponAnim.currentTrigger === "spawn_bullet") {
                weaponAnim.currentTrigger = '';
                // 直接传组件里的向量引用，createBullet 内部立刻拷贝，安全且零分配
                this.createBullet(ownerId, weaponComponent.aimDirection, weaponNode);
            }

        }
    }

    private createBullet(ownerId: number, direction: Vec2Like, weaponNode: Node) {
        let entity = this.world.createEntity();
        let posComp: PosComponent = this.world.addComp(entity.id, PosComponent);
        let ownerPos = this.world.getComp(ownerId, PosComponent);
        if (ownerPos) copyVec2(posComp.pos, ownerPos.pos);
        let velComp: VelocityComponent = this.world.addComp(entity.id, VelocityComponent);
        let bulletComp: BulletComponent = this.world.addComp(entity.id, BulletComponent);
        let viewComp: ViewComponent = this.world.addComp(entity.id, ViewComponent);
        let ownerComp: OwnerComponent = this.world.addComp(entity.id, OwnerComponent);
        let damageComp: DamageComponent = this.world.addComp(entity.id, DamageComponent);
        let anim = this.world.addComp(entity.id, AnimComponent);
        anim.configs.set(IState.fly, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.BulletFly),
            interval: 999,
            loop: true,
        } as any);
        anim.configs.set(IState.Explode, {
            type: 'sequence',
            frames: resBridge.getFrames(PathEnum.Explosion),
            interval: 0.06,
            loop: false,
            events: { 0: "damage" },
        } as any);
        anim.state = IState.fly;

        // 直接从池中取节点：预热过的实例在这里复用，池空才会 instantiate
        viewComp.node = resBridge.spawn(PathEnum.Bullet1, UIEnum.Bullet2);
        ownerComp.ownerId = ownerId;
        damageComp.damage = BATTLE_CONFIG.bulletDamage;
        copyVec2(velComp.direction, direction);
        velComp.speed = BATTLE_CONFIG.bulletSpeed;
        bulletComp.entity = entity;
        viewComp.node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
        if (weaponNode) viewComp.node.setPosition(weaponNode.position.clone());
    }
}
