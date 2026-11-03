
import { _decorator, Component, Node } from 'cc';
import { IWorld } from './Base/IWorld';
import { Entity, EntityPool } from './entity';
import { ComponentManager, SystemManager } from './tool';
import { ISystem } from './Base/ISystem';
import { ComponentClass } from './tool/ComponentManager';
import { IComponent } from './Base/IComponent';
import { AnimComponent, BattleStateComponent, BulletComponent, DamageComponent, EnemyAIComponent, EnemyComponent, HealthComponent, OwnerComponent, PlayerInputComponent, PosComponent, ScoreComponent, VelocityComponent, ViewComponent, WeaponComponent } from './Component';
import { AISystem, AnimRenderSystem, AnimTickSystem, BulletDirSystem, BulletSystem, ChecksumSystem, DamageSystem, DeathSystem, EnemySpawnSystem, FaceDirectionSystem, InputSystem, MonsterClipSystem, MonsterStateProbeSystem, MonsterStateSystem, MonsterVisualSystem, MoveSystem, NodeRecyclerSystem, PosSynSystem, ScoreSystem, ScriptedInputSystem, SnapshotTestSystem, WaveSystem, WeaponAimSystem, WeaponViewSystem, WeaponSystem } from './System';
import { MonsterStateComponent } from './Component/MonsterStateComponent';
import { FixedStepClock } from './tool/FixedStepClock';
import { GameTestRunner } from './Test/GameTestRunner';
import { logicRng } from './Math/PRNG';
import { FrameInput, FrameInputBuffer, IFrameInputSource } from './Input/FrameInput';
import { LocalInputSource } from './Input/LocalInputSource';
import { copyValue, IWorldSnapshot } from './tool/Snapshot';
import { DeferredNodeRecycler } from './tool/DeferredNodeRecycler';
import { RollbackController } from './Net/RollbackController';
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
    /**当前是否为联机模式（联机时禁用手工快照自检，避免和回滚控制器打架）*/
    public networkMode: boolean = false;
    /**回滚控制器：联机预测模式下挂载，负责快照与回滚重演*/
    private rollback: RollbackController = null;
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

        // 回滚处理必须发生在逻辑帧边界 —— 不能在网络回调里直接改世界状态，
        // 那会撕裂正在跑的模拟。网络层只入队，这里统一处理。
        if (this.rollback) {
            this.rollback.processPending();
        }

        // 累积真实时间（带积压上限）
        this.clock.addTime(dt);

        let executed = 0;
        while (executed < this.clock.maxCatchUp && this.clock.canStep()) {
            const next = this.frame + 1;

            if (this.inputSource) {
                // 为下一帧准备输入（本地采样 / 从网络包解出）
                this.inputSource.produce(next, this.playerCount);
                // 锁步等待：该帧输入没到齐就停下，【不消费时间】，
                // 这样等包期间累积的时间不会被吞掉，包到了立刻连续补上
                if (!this.inputSource.ready(next, this.playerCount)) {
                    this.stalled = true;
                    break;
                }
                this.stalled = false;
                // 每 64 帧清理一次过旧输入，保留窗口供将来回滚使用
                if ((next & 63) === 0) this.inputSource.prune(next);
            }

            this.clock.consumeStep();
            // 先推进帧号再 tick：本帧内写入 enterFrame 的实体，帧龄从 0 开始计
            this.frame = next;
            this.systemManager.update(this.clock.dt);
            executed++;

            // 回滚控制器需要在每一帧结束后存快照（回滚要能回到这一帧之前）
            if (this.rollback) {
                this.rollback.captureFrame(this.frame);
            }
        }
    }

    /**
     * @description 执行一帧逻辑（不推进帧号，由调用方负责）
     *
     * 回滚重演专用：回滚时帧号已经被还原到某个历史值，
     * 重演过程要精确按帧号推进，不能靠"当前帧 +1"。
     */
    public stepFrame(): void {
        this.systemManager.update(this.clock.dt);
    }

    /**
     * @description 设置当前帧号
     * 回滚重演时用来把帧号拨回历史位置
     */
    public setFrame(frame: number): void {
        this.frame = frame;
    }

    /**
     * @description 挂载回滚控制器
     * 挂上之后 World 每帧结束会自动存快照
     */
    public setRollbackController(controller: RollbackController | null): void {
        this.rollback = controller;
        // 起始帧的基线快照必须存在：
        // 回滚到第 1 帧时需要"第 0 帧之后"的状态作为还原点，
        // 没有它的话第一次分歧就会因为找不到快照而回滚失败 → 永久分叉。
        if (controller) {
            controller.captureFrame(this.frame);
        }
    }

    /**当前挂载的回滚控制器（没有则 null）*/
    public getRollbackController(): RollbackController | null {
        return this.rollback;
    }

    /**
     * @description 设置起始帧号
     * 联机时必须用服务端下发的帧号对齐，否则客户端从 0 开始数，
     * 而输入缓冲里存的是服务端的帧号，两边的帧号永远对不上，世界会一直卡住。
     */
    setStartFrame(frame: number): void {
        this.frame = frame;
        this.stalled = false;
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

    //#region 快照 / 回滚
    /**
     * @description 导出整个逻辑世界的快照
     * 包含：全部组件数据、实体顺序、系统私有状态、实体池、随机数、帧号。
     * 不包含任何渲染数据 —— 视图层自己负责对齐。
     */
    public captureSnapshot(): IWorldSnapshot {
        const comp = this.componentManager.captureState();
        return {
            frame: this.frame,
            entityOrder: comp.entityOrder,
            components: comp.components,
            systems: this.systemManager.captureState(),
            nextId: this.entityPool.nextId,
            freeList: this.entityPool.freeList.slice(),
            generations: copyValue(this.entityPool.generations),
            rngState: logicRng.snapshot(),
        };
    }

    /**
     * @description 还原整个逻辑世界
     * 还原后组件实例是全新对象，任何缓存过组件引用的地方必须重新 getComp()。
     * 还原不会自动把帧号回退到"下一帧"，
     * 调用方需要自己决定是继续跑还是重演。
     */
    public restoreSnapshot(snapshot: IWorldSnapshot): void {
        // 还原前记下当前所有实体节点：窗口内新建的实体在还原后就不该存在了，
        // 它们的节点必须清理掉，否则会在场景里留下"幽灵"
        const before = this.collectEntityNodes();

        this.componentManager.restoreState({
            entityOrder: snapshot.entityOrder,
            components: snapshot.components,
        });
        this.entityPool.nextId = snapshot.nextId;
        this.entityPool.freeList = snapshot.freeList.slice();
        this.entityPool.generations = copyValue(snapshot.generations);
        this.systemManager.restoreState(snapshot.systems);
        logicRng.restore(snapshot.rngState);
        this.frame = snapshot.frame;

        // 还原后活着的实体节点
        const after = new Set<Node>();
        const restoredIds = this.componentManager.query(ViewComponent);
        for (let i = 0; i < restoredIds.length; i++) {
            const view = this.componentManager.getComp(restoredIds[i], ViewComponent);
            if (view && view.node) {
                after.add(view.node);
                // 复活：死亡时被隐藏的节点，回滚后要重新显示
                if (view.node.isValid && !view.node.active) {
                    view.node.active = true;
                    // 撤销待回收标记 —— 它要活着，不能被回收器销毁
                    DeferredNodeRecycler.unmark(view.node);
                }
            }
        }

        // 窗口内新建、现在已不存在的实体 → 节点销毁
        for (let i = 0; i < before.length; i++) {
            const node = before[i];
            if (node && !after.has(node) && node.isValid) {
                DeferredNodeRecycler.unmark(node);
                node.destroy();
            }
        }
    }

    /**收集当前所有实体绑定的节点（渲染层对齐用）*/
    private collectEntityNodes(): Node[] {
        const out: Node[] = [];
        const ids = this.componentManager.query(ViewComponent);
        for (let i = 0; i < ids.length; i++) {
            const view = this.componentManager.getComp(ids[i], ViewComponent);
            if (view && view.node) out.push(view.node);
        }
        return out;
    }
    //#endregion

    /**当前参与同步的玩家数量*/
    getPlayerCount(): number {
        return this.playerCount;
    }

    /**房间人数变化时由网络层通知（新玩家加入后会重建实体）*/
    setPlayerCount(count: number): void {
        if (count > 0) this.playerCount = count;
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
        this.registerComponent(BattleStateComponent);
        this.registerComponent(ScoreComponent);
        //#region 逻辑段：只读写组件数据，不碰任何节点
        // 脚本输入要在 InputSystem 之前注入，否则本帧采到的是上一帧的输入
        this.registerSystem(new ScriptedInputSystem(), -1);
        this.registerSystem(new InputSystem(), 0);
        // 对局导演要排在刷怪之前：它决定"什么时候刷、刷什么"
        this.registerSystem(new WaveSystem(), 3);
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
        // 计分要在状态机之后（怪物得先进入 Dead 状态），但要在死亡销毁之前
        this.registerSystem(new ScoreSystem(), 128);
        this.registerSystem(new DeathSystem(), 130);
        // 动画推进属于逻辑：frameIndex / currentTrigger 会影响射击等玩法时序
        this.registerSystem(new AnimTickSystem(), 140);
        // 节点回收：排在死亡之后，保证能看见本帧新标记的待回收节点
        this.registerSystem(new NodeRecyclerSystem(), 150);
        //#endregion

        //#region 渲染段：只读组件，写节点，不回写逻辑
        this.registerSystem(new PosSynSystem(), 200);
        this.registerSystem(new FaceDirectionSystem(), 201);
        // 怪物表现接管怪物节点的 position/scale/angle/color，必须在 PosSynSystem 之后
        this.registerSystem(new MonsterVisualSystem(), 202);
        // clip 动画播在表现层子节点上，与根节点的表现变换互不干扰
        this.registerSystem(new MonsterClipSystem(), 204);
        this.registerSystem(new BulletDirSystem(), 203);
        this.registerSystem(new WeaponViewSystem(), 209);
        this.registerSystem(new AnimRenderSystem(), 500);
        //#endregion

        // 校验和放最后，确保拿到的是本帧全部逻辑写入之后的状态
        this.registerSystem(new ChecksumSystem(), 1000);
        // 快照往返自检放最后：它会还原世界，必须在其他系统都跑完之后
        this.registerSystem(new SnapshotTestSystem(), 1001);
        // 怪物状态探针：统计四态覆盖情况
        this.registerSystem(new MonsterStateProbeSystem(), 1002);
        // 运行时断言：检查位置/血量/方向/实体数这些"任何一帧都必须成立"的不变量
        // 默认 enable=false，验证时打开 GameTestRunner.enabled 即可
        this.registerSystem(new GameTestRunner(), 1003);
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
    /**
     * @description 查询所有实体 id
     * 重开一局时需要销毁全部实体 —— 那时不知道对方有哪些组件类型，
     * 所以需要一个"全量"入口，不能靠 query(具体组件) 拼。
     */
    getAllEntityIds(): number[] {
        return this.componentManager ? this.componentManager.queryAll() : [];
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

