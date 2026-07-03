import { director, instantiate, UITransform, v2, v3 } from "cc";
import { ISystem } from "../Base/ISystem";
import { AnimComponent, PosComponent, VelocityComponent, ViewComponent } from "../Component";
import { EnemyAIComponent } from "../Component/EnemyAIComponent";
import { EnemyComponent } from "../Component/EnemyComponent";
import { HealthComponent } from "../Component/HealthComponent";
import { ComponentClass } from "../tool/ComponentManager";
import { resMgr } from "../../core/manager/ResManager";
import { LayerEnum, PathEnum, UIEnum, uiMgr } from "../../core/manager/UIManager";
import { HitCooldownComponent } from "../Component/HitCooldownComponent";
import { IState } from "../Component/AnimComponent";


export class EnemySpawnSystem extends ISystem {
    private timer: number = 0;
    private spawInterval: number = 1;
    private side: number[] = [1, 2, 3, 4];//分别对应 上右下左 顺时针方向
    requiredComponents: ComponentClass<any>[] = [];
    private w: number = 0;
    private h: number = 0;
    init(): void {
        this.enable = true;
        this.w = director.getScene().getChildByName("Canvas").getComponent(UITransform).width / 2;
        this.h = director.getScene().getChildByName("Canvas").getComponent(UITransform).height / 2;
    }
    update(dt: number): void {
        this.timer += dt;
        if (this.timer >= this.spawInterval) {
            this.timer = 0;
            //执行怪物生成的逻辑
            this.swapnEnemy();
        }
    }
    private swapnEnemy() {
        //随机选择一个方向
        let side = this.side[Math.floor(Math.random() * this.side.length)];
        //创建怪物
        let enemy = this.createEnemy(side);
    }
    private createEnemy(side: number) {
        let entity = this.world.createEntity();
        let enemyComp: EnemyComponent = this.world.addComp(entity.id, EnemyComponent);
        this.world.addComp(entity.id, EnemyAIComponent);
        this.world.addComp(entity.id, HitCooldownComponent);
        let posComp: PosComponent = this.world.addComp(entity.id, PosComponent);
        let animComp: AnimComponent = this.world.addComp(entity.id, AnimComponent);
        let viewComp: ViewComponent = this.world.addComp(entity.id, ViewComponent);
        let velComp: VelocityComponent = this.world.addComp(entity.id, VelocityComponent);
        let healthComp: HealthComponent = this.world.addComp(entity.id, HealthComponent);
        //计算怪物出现的位置

        let randomPos = v3(0, 0, 0);
        switch (side) {
            case 1:
                randomPos = v3(this.getRandomSign() * Math.random() * this.w, this.h, 0);
                break;
            case 2:
                randomPos = v3(this.w, this.getRandomSign() * Math.random() * this.h, 0);
                break;
            case 3:
                randomPos = v3(this.getRandomSign() * Math.random() * this.w, -this.h, 0);
                break;
            case 4:
                randomPos = v3(-this.w, this.getRandomSign() * Math.random() * this.h, 0);
                break;
        }
        //设置怪物的基础属性
        viewComp.node = instantiate(resMgr.getPrefab(PathEnum.Enemy, UIEnum.Enemy));
        viewComp.node.parent = uiMgr.getLayer(LayerEnum.GameLayer);
        healthComp.health = 20;
        velComp.speed = 80;
        posComp.pos = randomPos;
        viewComp.node.position = randomPos;
        enemyComp.wave = 0;
        enemyComp.score = 10;

        // 怪物动画：idle 用 Prefab 自带 Sprite，dead 播完即销毁
        animComp.configs.set('idle', { type: 'sequence', frames: [], interval: 999, loop: true } as any);
        animComp.configs.set('dead', { type: 'sequence', frames: [], interval: 0.001, loop: false } as any);
        animComp.state = IState.Idle;

    }
    //随机获得1或-1
    private getRandomSign(): number {
        return Math.random() > 0.5 ? 1 : -1;
    }
}