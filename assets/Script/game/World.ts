
import { _decorator, Component, Node } from 'cc';
import { IWorld } from './Base/IWorld';
import { Entity, EntityPool } from './entity';
import { ComponentManager, SystemManager } from './tool';
import { ISystem } from './Base/ISystem';
import { ComponentClass } from './tool/ComponentManager';
import { IComponent } from './Base/IComponent';
import { AnimComponent, BulletComponent, DamageComponent, EnemyAIComponent, EnemyComponent, HealthComponent, OwnerComponent, PlayerInputComponent, PosComponent, VelocityComponent, ViewComponent, WeaponComponent } from './Component';
import { AISystem, AnimRenderSystem, AnimTickSystem, BulletDirSystem, BulletSystem, ChecksumSystem, DamageSystem, DeathSystem, EnemySpawnSystem, FaceDirectionSystem, InputSystem, MonsterStateSystem, MonsterVisualSystem, MoveSystem, PosSynSystem, WeaponAimSystem, WeaponViewSystem, WeaponSystem } from './System';
import { MonsterStateComponent } from './Component/MonsterStateComponent';
import { FixedStepClock } from './tool/FixedStepClock';
import { FrameInput, FrameInputBuffer, IFrameInputSource } from './Input/FrameInput';
import { LocalInputSource } from './Input/LocalInputSource';
import { resBridge } from '../core/resource/ResBridge';


/**
 *@description 世界类
 * 作为ECS框架的核心 需要统管所有System
 * 核心职责是 负责EC的CRUD操作
 * 并调度所有System的执行
 **/
class World implements IWorld {
    private entityPool: EntityPool;
    private componentManager: ComponentManager;
    private systemManager: SystemManager;
    /**固定步长时钟：把不稳定的渲染 dt 换成恒定步长的逻辑帧*/
    private clock: FixedStepClock;
    /**
     * 当前逻辑帧号。
     * 这是系统内唯一允许使用的时间单位 —— 所有状态时长、动画帧龄都以它为基准，
     * 不直接使用渲染 dt，这样后续接帧同步时语义完全一致。
     */
    public frame: number = 0;
    /**输入帧缓冲：按帧号存所有玩家的输入*/
    private inputBuffer: FrameInputBuffer;
    /**输入来源（本地采样 / 网络收包）*/
    private inputSource: IFrameInputSource = null;
    /**参与同步的玩家数量*/
    private playerCount: number = 1;
    /**是否因等待输入而卡住（锁步模式下会短暂出现）*/
    public stalled: boolean = false;
    private static _instance: World = null;
    private constructor() { }
    /**获取单实例 */
    public static get instance(): World {
        if (!this._instance) {
            this._instance = new World();
        }
        return this._instance;
    }

    init() {
        //启动闸门：资源未封盘前禁止拉起世界。
        //System.init() 会在注册时同步读资源，若此时资源层还没就绪，
        //拿到的就是空值或触发隐式加载，问题会在运行期才暴露。
        resBridge.assertReady("World.init");
        this.entityPool = new EntityPool();
        this.componentManager = new ComponentManager();
        this.systemManager = new SystemManager();
        this.clock = new FixedStepClock();
        this.frame = 0;
        this.inputBuffer = new FrameInputBuffer();
        // 默认走本地采样；联机时调用 setInputSource 换成收包实现即可
        this.inputSource = new LocalInputSource(this.inputBuffer);
        this.playerCount = 1;
        this.stalled = false;
        // this.systemManager.init();
        this.addBase()
    }
    onDestroy() {
        this.entityPool = null;
        this.componentManager = null;
        this.systemManager = null;
        this.clock = null;
        this.frame = 0;
        // this.offAllBase();
    }
    update(dt: number) {
        if (!this.clock) return;
        // 把渲染帧的不稳定 dt 兑换成整数次固定步长 tick。
        // 一次渲染帧可能需要补跑 0~N 个逻辑帧，超出上限就丢弃积压（防止死亡螺旋）。
        const steps = this.clock.advance(dt);
        for (let i = 0; i < steps; i++) {
            const next = this.frame + 1;

            if (this.inputSource) {
                // 为下一帧准备输入（本地采样 / 从网络包解出）
                this.inputSource.produce(next, this.playerCount);
                // 锁步等待：该帧输入没到齐就不推进，本渲染帧到此为止。
                // 单机模式下 ready() 恒为 true，这里永远不会卡。
                if (!this.inputSource.ready(next, this.playerCount)) {
                    this.stalled = true;
                    break;
                }
                this.stalled = false;
                // 每 64 帧清理一次过旧输入，保留窗口供将来回滚使用
                if ((next & 63) === 0) this.inputSource.prune(next);
            }

            // 先推进帧号再 tick：本帧内写入 enterFrame 的实体，帧龄从 0 开始计
            this.frame = next;
            this.systemManager.update(this.clock.dt);
        }
    }

    /**
     * @description 设置输入来源
     * 单机：new LocalInputSource(buffer)
     * 联机：换成收包的 NetworkInputSource，其余代码不用动
     */
    setInputSource(source: IFrameInputSource, playerCount: number = 1): void {
        this.inputSource = source;
        this.playerCount = playerCount;
    }

    /**逻辑层读取输入的唯一入口*/
    getInput(frame: number, playerIndex: number): FrameInput | null {
        return this.inputBuffer ? this.inputBuffer.get(frame, playerIndex) : null;
    }

    /**供外部（网络层）访问输入缓冲，用于塞入服务端下发的输入包*/
    getInputBuffer(): FrameInputBuffer {
        return this.inputBuffer;
    }
    /**
     * @description 添加组件 
     * 用于在系统中使用组件。
     * @param componentClass 组件类
     * 
    */
    addBase() {
        this.registerComponent(PosComponent);
        this.registerComponent(VelocityComponent);
        this.registerComponent(PlayerInputComponent);
        this.registerComponent(ViewComponent);
        this.registerComponent(AnimComponent);
        this.registerComponent(BulletComponent);
        this.registerComponent(OwnerComponent);
        this.registerComponent(WeaponComponent);
        this.registerComponent(EnemyComponent);
        this.registerComponent(EnemyAIComponent);
        this.registerComponent(HealthComponent);
        this.registerComponent(DamageComponent);
        this.registerComponent(MonsterStateComponent);
        //#region 逻辑段：只读写组件数据，不碰任何节点
        this.registerSystem(new InputSystem(), 0);
        this.registerSystem(new EnemySpawnSystem(), 5);
        // 武器朝向要在 WeaponSystem 之前算好，本帧射击就能用上本帧方向
        this.registerSystem(new WeaponAimSystem(), 10);
        this.registerSystem(new WeaponSystem(), 90);
        this.registerSystem(new AISystem(), 96);
        this.registerSystem(new MoveSystem(), 100);
        this.registerSystem(new BulletSystem(), 105);
        this.registerSystem(new DamageSystem(), 120);
        // 状态机必须排在伤害结算之后：DamageSystem 置 hurtThisFrame，状态机当帧消费
        this.registerSystem(new MonsterStateSystem(), 125);
        this.registerSystem(new DeathSystem(), 130);
        // 动画推进属于逻辑：frameIndex / currentTrigger 会影响射击等玩法时序
        this.registerSystem(new AnimTickSystem(), 140);
        //#endregion

        //#region 渲染段：只读组件，写节点，不回写逻辑
        this.registerSystem(new PosSynSystem(), 200);
        this.registerSystem(new FaceDirectionSystem(), 201);
        // 怪物表现接管怪物节点的 position/scale/angle/color，必须在 PosSynSystem 之后
        this.registerSystem(new MonsterVisualSystem(), 202);
        this.registerSystem(new BulletDirSystem(), 203);
        this.registerSystem(new WeaponViewSystem(), 209);
        this.registerSystem(new AnimRenderSystem(), 500);
        //#endregion

        // 校验和放最后，确保拿到的是本帧全部逻辑写入之后的状态
        this.registerSystem(new ChecksumSystem(), 1000);
    }

    offAllBase() {
        this.componentManager.clean();
        this.systemManager.clean();
    }
    //#region 实体API
    /**创建实体
     * @returns 新创建的实体的数据。
    */
    createEntity(): Entity {
        return this.entityPool.create();
    }
    /**
     * @description 销毁实体 并将其返回到实体池中。
     * 实体池会自动管理实体的内存，避免内存泄漏。
     * @param entity 实体对象
    */
    removeEntity(entity: Entity): void {
        this.componentManager.removeAllComponents(entity.id);
        this.entityPool.destroy(entity);
    }
    removeEntityById(entityId: number): void {
        let gen = this.entityPool.generations.get(entityId);
        if (gen === undefined) return;
        this.removeEntity({ id: entityId, generation: gen });
    }
    /**查询实体
     * 通过使用池提供的方法判断实体是否存活。
     * @returns 实体是否存活
    */
    isEntityAlive(entity: Entity): boolean {
        return this.entityPool.isAlive(entity);
    }
    //#endregion    

    //#region 组件API
    /**
     * @description 注册组件 
     * 用于在系统中使用组件。
     * 每个组件都有一个唯一的位索引，用于在位集中存储组件是否存在。
     * @param componentClass 组件类
     * @param bit 位索引 默认64位
    */
    registerComponent(componentClass: new (...args: any[]) => any, bit?: number): void {

        this.componentManager.registerComponent(componentClass, bit);
    }
    /**
     * @description 添加组件到实体
     * 用于为实体添加组件，使实体具备组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
    */
    addComp(entityId: number, componentClass: new (...args: any[]) => any): any {
        return this.componentManager.addComponent(entityId, componentClass);
    }
    /**
     * @description 从实体中移除组件
     * 用于从实体中移除组件，使实体失去组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
    */
    removeComp(entityId: number, componentClass: new (...args: any[]) => any): void {
        this.componentManager.removeComponent(entityId, componentClass);
    }
    /**
     * @description 查询实体是否包含组件
     * 用于检查实体是否具备组件的功能。
     * @param entityId 实体ID
     * @param componentClass 组件类
     * @returns 实体是否包含组件
    */
    hasComp(entityId: number, componentClass: new (...args: any[]) => any): boolean {
        return this.componentManager.hasComponent(entityId, componentClass);
    }
    //#endregion
    //#region 系统API
    /**
     * @description 注册系统
     * 用于在世界中使用系统。
     * 每个系统都有一个唯一的优先级，用于在系统执行时按优先级排序。
     * @param systemClass 系统类
    */
    registerSystem(system: ISystem, priority: number): void {
        system.world = this;
        system.init();
        this.systemManager.registerSystem(system, priority);
    }

    getSystem(cls: new (...args: any[]) => ISystem): ISystem | undefined {
        return this.systemManager.getSystem(cls);
    }
    //开启或关闭系统
    enableOrDisable(cls: new (...args: any[]) => ISystem, enable: boolean): void {
        this.systemManager.enableOrDisable(cls, enable);
    }
    //#endregion
    //#region 接口API
    /**
     * @description 查询实体
     * 用于查询所有包含指定组件的实体。
     * @param componentClasses 组件类数组
     * @returns 包含指定组件的实体ID数组
    */
    query(...componentClasses: ComponentClass<any>[]): number[] {
        return this.componentManager.query(...componentClasses);
    }
    /**
     * @description 获取实体组件
     * 用于获取实体的指定组件。
     * @param entity 实体ID
     * @param componentClass 组件类
     * @returns 实体的指定组件
    */
    getComp<T extends IComponent>(entityId: number, componentClass: ComponentClass<T>): T | undefined {
        return this.componentManager.getComp(entityId, componentClass);
    }
    //#endregion
}
export const world = World.instance;

