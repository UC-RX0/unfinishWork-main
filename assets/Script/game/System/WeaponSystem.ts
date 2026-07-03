import { Node, Vec2 } from "cc";
import { inputMgr } from "../../core/manager/InputManager";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, BulletComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";
import { resMgr } from "../../core/manager/ResManager";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../../core/manager/UIManager";
import { DamageComponent } from "../Component/DamageComponent";
import { IState } from "../Component/AnimComponent";
import { GameLaunch } from "../../GameLaunch";
import { NodePool } from "../tool/NodePool";

//优先级90

export class WeaponSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [WeaponComponent, OwnerComponent];
    static bulletPool: NodePool = null;

    init(): void {
        this.enable = true;
        if (!WeaponSystem.bulletPool) {
            let prefab = resMgr.getPrefab(PathEnum.Bullet1, UIEnum.Bullet2);
            WeaponSystem.bulletPool = new NodePool(prefab);
        }
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

            // 按射击 → 播放攻击动画
            if (inputMgr.wantsToFire(playerIndex) && weaponAnim.state !== IState.Attack) {
                weaponAnim.nextState = IState.Attack;
            }

            // 攻击动画帧事件 → 发射子弹
            if (weaponAnim.currentTrigger === "spawn_bullet") {
                weaponAnim.currentTrigger = '';
                let direction = weaponComponent.aimDirection.clone();
                this.createBullet(ownerId, direction, weaponNode);
            }

        }
    }

    private createBullet(ownerId: number, direction: Vec2, weaponNode: Node) {
        let entity = this.world.createEntity();
        let posComp: PosComponent = this.world.addComp(entity.id, PosComponent);
        let ownerPos = this.world.getComp(ownerId, PosComponent);
        if (ownerPos) posComp.pos.set(ownerPos.pos);
        let velComp: VelocityComponent = this.world.addComp(entity.id, VelocityComponent);
        let bulletComp: BulletComponent = this.world.addComp(entity.id, BulletComponent);
        let viewComp: ViewComponent = this.world.addComp(entity.id, ViewComponent);
        let ownerComp: OwnerComponent = this.world.addComp(entity.id, OwnerComponent);
        let damageComp: DamageComponent = this.world.addComp(entity.id, DamageComponent);
        let anim = this.world.addComp(entity.id, AnimComponent);
        anim.configs.set(IState.fly, {
            type: 'sequence',
            frames: resMgr.getSpriteFrames("texture/bullet/bullet2"),
            interval: 999,
            loop: true,
        } as any);
        anim.configs.set(IState.Explode, {
            type: 'sequence',
            frames: GameLaunch.explodeFrames,
            interval: 0.06,
            loop: false,
            events: { 0: "damage" },
        } as any);
        anim.state = IState.fly;

        viewComp.node = WeaponSystem.bulletPool.get();
        ownerComp.ownerId = ownerId;
        damageComp.damage = 10;
        velComp.direction.set(direction);
        velComp.speed = 300;
        bulletComp.entity = entity;
        viewComp.node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
        if (weaponNode) viewComp.node.setPosition(weaponNode.position.clone());
    }
}