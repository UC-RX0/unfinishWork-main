import { instantiate, Vec2 } from "cc";
import { inputMgr } from "../../core/manager/InputManager";
import { ISystem } from "../Base/ISystem";
import { BulletComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from "../Component";
import { ComponentClass } from "../tool/ComponentManager";
import { resMgr } from "../../core/manager/ResManager";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../../core/manager/UIManager";

//优先级90

export class WeaponSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [WeaponComponent, OwnerComponent];
    init(): void {
        this.enable = true;
    }
    update(dt: number): void {
        let entitis = this.world.query(...this.requiredComponents);
        for (const entity of entitis) {
            let weaponComponent = this.world.getComp(entity, WeaponComponent);
            let { ownerId } = this.world.getComp(entity, OwnerComponent);

            let playerInput = this.world.getComp(ownerId, PlayerInputComponent);
            if (!playerInput) continue;
            const playerIndex = playerInput.playerIndex;
            if (playerIndex === null || playerIndex === undefined) continue;

            // 攻击冷却计时
            weaponComponent.timer += dt;
            if (weaponComponent.timer >= weaponComponent.fireInterval) {
                if (inputMgr.wantsToFire(playerIndex)) {
                    weaponComponent.timer -= weaponComponent.fireInterval;
                    // 从角度计算子弹方向
                    let rad = weaponComponent.angle * Math.PI / 180;
                    let direction = new Vec2(Math.cos(rad), Math.sin(rad));
                    this.createBullet(ownerId, direction);
                } else {
                    weaponComponent.timer = weaponComponent.fireInterval;
                }
            }
        }
    }

    private createBullet(ownerId: number, direction: Vec2) {
        //创建子弹
        let entity = this.world.createEntity();
        this.world.addComp(entity.id, PosComponent);
        let velComp: VelocityComponent = this.world.addComp(entity.id, VelocityComponent);
        let bulletComp: BulletComponent = this.world.addComp(entity.id, BulletComponent);
        let viewComp: ViewComponent = this.world.addComp(entity.id, ViewComponent);
        let ownerComp: OwnerComponent = this.world.addComp(entity.id, OwnerComponent);
        viewComp.node = instantiate(resMgr.getPrefab(PathEnum.Bullet2, UIEnum.Bullet2));
        ownerComp.ownerId = ownerId;
        velComp.direction.set(direction);
        velComp.speed = bulletComp.speed;
        bulletComp.entity = entity;
        viewComp.node.setParent(uiMgr.getLayer(LayerEnum.GameLayer));
    }
}