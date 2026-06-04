# ECS 框架开发文档

## 一、整体架构

```
assets/Script/game/
├── entity.ts              Entity + EntityPool
├── IComponent.ts          组件标记接口
├── World.ts               编排器（Cocos Component）
├── BitSet.ts              位掩码，签名匹配
├── ComponentArray.ts      单类型组件的 SoA 存储
├── ComponentManager.ts    组件注册/增删查 + 签名维护
├── ISystem.ts             System 抽象基类 + IWorld 接口
├── SystemManager.ts       System 注册/排序/tick 调度
├── Component/
│   ├── index.ts
│   ├── PosComponent.ts
│   └── VelocityComponent.ts
└── System/
    └── MoveSystem.ts
```

---

## 二、核心思想：System 是行为规则，不是事件处理器

### 2.1 传统事件驱动 vs ECS

**事件驱动**的做法是：收到移动输入 → 直接改位置。这会导致逻辑分散，输入处理、移动计算、渲染更新混在一起。

**ECS 的做法**：每个 System 都是一条独立的规则，每帧都执行，但只处理自己关心的组件：

```
每帧：
  InputSystem  → 读取输入，写入 VelocityComponent（只改速度，不改位置）
  MoveSystem   → 读取 VelocityComponent，更新 PosComponent（只改位置）
  RenderSystem → 读取 PosComponent，同步到 Node.position（只负责显示）
```

每个 System 只做一件事，组合起来就产生复杂行为。

### 2.2 为什么这样更好？

以子弹为例：子弹不需要输入，但它也需要移动。

- **事件驱动**：你得为子弹单独写一套移动逻辑，或者在移动事件里区分"是玩家还是子弹"
- **ECS**：子弹有 VelocityComponent，MoveSystem 自动处理它。和玩家走同一套代码，不需要区分

```ts
// 子弹和玩家共用同一个 MoveSystem
// MoveSystem 不关心"谁"，只关心"有 PosComponent + VelocityComponent 的都处理"
class MoveSystem extends ISystem {
    update(dt) {
        const entities = this.world.query(PosComponent, VelocityComponent);
        for (const eid of entities) {
            const pos = this.world.getComp(eid, PosComponent);
            const vel = this.world.getComp(eid, VelocityComponent);
            pos.pos.x += vel.velocity * dt;
        }
    }
}
```

### 2.3 输入怎么处理？

InputSystem 每帧都执行，但只在**有输入时**才写数据：

```ts
class InputSystem extends ISystem {
    update(dt) {
        const input = this.getInput();   // 读取摇杆/键盘
        if (!input) return;              // 没输入就跳过，什么都不改

        // 只改 velocity，不改 position
        const entities = this.world.query(VelocityComponent);
        for (const eid of entities) {
            const vel = this.world.getComp(eid, VelocityComponent);
            vel.velocity = input.direction * input.speed;
        }
    }
}
```

### 2.4 完整的一帧流程

```
第1帧：玩家推摇杆
  InputSystem   → velocity = 5
  MoveSystem    → pos.x += 5 * dt
  RenderSystem  → Node.position = pos

第2帧：玩家松手
  InputSystem   → 没输入，跳过（velocity 保持 5，不会突然归零）
  MoveSystem    → pos.x += 5 * dt（继续移动，模拟惯性）

第3帧：摩擦力生效
  FrictionSystem → velocity *= 0.9
  MoveSystem     → pos.x += 4.5 * dt
  RenderSystem   → Node.position = pos
```

### 2.5 组合出复杂行为

通过组合不同的 System，不需要修改任何已有代码就能产生新行为：

| 组件组合 | 产生的行为 |
|----------|-----------|
| PosComponent | 只有位置，不移动（静态物体） |
| PosComponent + VelocityComponent | 自动移动（玩家、子弹、NPC） |
| PosComponent + VelocityComponent + FrictionComponent | 移动 + 减速（地面角色） |
| PosComponent + VelocityComponent + GravityComponent | 移动 + 重力（跳跃、下落） |

添加"重力"只需要新建一个 GravityComponent 和 GravitySystem，不需要改 MoveSystem。

---

## 三、核心概念

### 3.1 Entity（实体）

- 纯数据标识 = `id`（密集整数，用作数组下标）+ `generation`（代数，检测过期引用）
- 不持有任何组件，组件由 ComponentManager 统一存储

```ts
class Entity {
    id: number;
    generation: number;
}
```

### 3.2 Component（组件）

- 纯数据类，实现 `IComponent` 接口
- 不含 `id` 字段（归属关系由存储结构隐式表达）
- 必须有无参构造函数（ComponentManager 通过 `new T()` 创建默认实例）

```ts
// 组件只需关注数据
class PosComponent implements IComponent {
    public pos: Vec3 = v3(0, 0, 0);
}
```

### 3.3 System（系统）

- 继承 `ISystem`，实现 `update()` 方法
- 声明自己需要哪些组件（`requiredComponents`）
- 每帧由 SystemManager 按优先级顺序调用
- 通过 `this.world.query(...)` 查询匹配的实体
- 通过 `this.world.getComp(...)` 获取组件数据

```ts
abstract class ISystem {
    world: IWorld;
    priority: number;              // 数字越小越先执行
    enabled: boolean;              // 可动态开关
    abstract requiredComponents: Function[];  // 声明需要的组件
    abstract update(dt: number): void;
}
```

### 3.4 World（世界）

- 继承 Cocos `Component`，挂载到场景节点
- 在 `onLoad()` 中初始化各 Manager
- 在 `update(dt)` 中驱动 SystemManager tick
- 是 ECS 的唯一入口，暴露 Entity / Component / System API

---

## 四、数据存储设计

### 4.1 SoA（Struct of Arrays）

组件按类型集中存储，而非挂在 Entity 上：

```
ComponentArray<PosComponent>:      Map<entityId, PosComponent>
ComponentArray<VelocityComponent>: Map<entityId, VelocityComponent>
```

遍历某类组件时，内存访问连续，比 AoS（每个 Entity 持有自己的组件袋）更友好。

### 4.2 BitSet 签名

每个组件类型分配唯一 bit 索引：
- `PosComponent` → bit 0
- `VelocityComponent` → bit 1

每个 Entity 拥有一个 BitSet 签名，记录它持有哪些组件。
System 查询时，用所需的 BitSet 与 Entity 签名做匹配：

```
Entity A: 持有 Pos + Vel → 签名 = 0b11
Entity B: 只有 Pos       → 签名 = 0b01

MovementSystem 需要 Pos + Vel → 需求 = 0b11

A: 0b11 & 0b11 == 0b11 → 匹配 ✓
B: 0b01 & 0b11 != 0b11 → 不匹配 ✗
```

### 4.3 Entity 对象池

- `nextId` 递增分配新 ID
- `freeList` 回收已销毁的 ID 供复用
- `generations: Map<id, generation>` —— 回收时 generation++，用于检测持有过期 Entity 引用的情况

---

## 五、各文件职责与关键方法

### 5.1 `BitSet.ts`

| 方法 | 说明 |
|------|------|
| `set(bit)` | 置位 |
| `clear(bit)` | 清除位 |
| `has(bit)` | 测试位 |
| `matches(required)` | `(this & required) == required`，核心查询谓词 |
| `equals(other)` | 逐 word 比较 |

存储用 `Uint32Array`，每 32 位一个 word，64 个组件类型只需 2 个 word。

### 5.2 `EntityPool`

| 方法 | 说明 |
|------|------|
| `create(): Entity` | 优先从 freeList 取 ID，否则 nextId++ |
| `destroy(entity)` | ID 放入 freeList |
| `isAlive(entity)` | 检查 generation 是否匹配 |

### 5.3 `ComponentArray<T>`

| 方法 | 说明 |
|------|------|
| `addData(entityId, component)` | 存入 Map |
| `removeData(entityId)` | 从 Map 删除 |
| `getData(entityId): T` | 取出组件 |
| `hasData(entityId): boolean` | 是否存在 |
| `getAllEntities()` | 返回所有 entityId 迭代器 |
| `size` | 组件数量 |

### 5.4 `ComponentManager`

核心字段：
- `componentArrays: Map<构造函数, ComponentArray>` —— 类型 → 存储
- `componentBitIndices: Map<构造函数, number>` —— 类型 → bit 索引
- `entitySignatures: Map<entityId, BitSet>` —— 实体 → 签名

| 方法 | 说明 |
|------|------|
| `registerComponent(cls, bit?)` | 注册组件类型，分配 bit 索引 |
| `addComponent(entityId, cls): T` | 创建默认实例并存入，更新签名 |
| `removeComponent(entityId, cls)` | 移除组件，更新签名 |
| `getComponent(entityId, cls): T` | 获取组件 |
| `hasComponent(entityId, cls)` | 是否拥有 |
| `removeAllComponents(entityId)` | 销毁实体时调用，清除所有组件和签名 |

### 5.5 `ISystem` + `IWorld` 接口

**IWorld 接口**（避免 ISystem ↔ World 循环依赖）：
```ts
interface IWorld {
    query(...componentClasses: Function[]): number[];
    getComp<T>(entityId: number, componentClass: new (...args) => T): T | undefined;
}
```

**ISystem 抽象类**：
```ts
abstract class ISystem {
    world: IWorld;                          // 注册时由 World 注入
    priority: number;                       // 数字越小越先执行
    enabled: boolean;                       // 可动态开关
    abstract requiredComponents: Function[]; // 声明需要哪些组件
    abstract update(dt: number): void;
}
```

### 5.6 `SystemManager`

| 方法 | 说明 |
|------|------|
| `registerSystem(system, priority)` | 注册，标记 needsSort |
| `unregisterSystem(cls)` | 按构造函数移除 |
| `update(dt)` | 排序 → 遍历 enabled 的 System → 调用 update |

排序只在 System 列表变化时执行一次，不是每帧排序。

### 5.7 `World`

**生命周期**：
- `onLoad()` → 初始化 EntityPool / ComponentManager / SystemManager
- `update(dt)` → `systemManager.update(dt)`
- `onDestroy()` → `clear()`

**Entity API**：`createEntity()` / `removeEntity()` / `isEntityAlive()`

**Component API**：`registerComponent()` / `addComp()` / `removeComp()` / `getComp()` / `hasComp()`

**System API**：`registerSystem()` / `getSystem()`

**Query**：
```ts
query(...componentClasses: Function[]): number[] {
    // 遍历 activeEntities
    // 对每个实体，检查其 BitSet 是否包含所有所需 bit
    // 匹配则加入结果数组
}
```

---

## 六、每帧数据流

```
Cocos update(dt)
  └→ World.update(dt)
       └→ SystemManager.update(dt)
            └→ 按优先序遍历各 System
                 └→ system.update(dt)
                      ├→ world.query(requiredComponents)  → 匹配的 entityId[]
                      ├→ world.getComp(eid, PosComponent)  → 组件数据
                      └→ 直接修改组件字段（组件是可变对象）
```

以玩家移动为例，一帧内的完整数据流：

```
1. InputSystem.update(dt)
   ├→ world.query(VelocityComponent)
   ├→ 读取摇杆输入 → 无输入 → return
   └→ 有输入 → world.getComp(eid, VelocityComponent).velocity = 5

2. MoveSystem.update(dt)
   ├→ world.query(PosComponent, VelocityComponent)
   ├→ world.getComp(eid, PosComponent)
   ├→ world.getComp(eid, VelocityComponent)
   └→ pos.pos.x += 5 * dt

3. RenderSystem.update(dt)
   ├→ world.query(PosComponent)
   └→ node.position = pos.pos（同步到场景节点）
```

---

## 七、注意事项

1. **循环依赖**：`ISystem` 引用 `IWorld` 接口，`World` 实现 `IWorld`，避免直接依赖
2. **Cocos 方法冲突**：`World extends Component`，Cocos 基类有 `addComponent` / `getComponent` 等方法，ECS 方法需要重命名（如 `addComp` / `getComp`）
3. **Cocos 私有字段冲突**：不要用 `_enabled` 等名称，与 Cocos 内部字段冲突
4. **无参构造函数**：`addComponent` 通过 `new cls()` 创建默认实例，所有组件必须有无参构造
5. **Query 性能**：当前 O(N) 遍历所有活跃实体，千级实体量级足够。万级以上可优化为"遍历最小 ComponentArray"
6. **ES2015 兼容**：`for...of` 遍历 Map.keys() 需要 `downlevelIteration`，用 `forEach` 替代更安全
7. **System 优先级**：数字越小越先执行。建议约定：
   - 0-99：输入相关（InputSystem）
   - 100-199：游戏逻辑（MoveSystem、CollisionSystem、AttackSystem）
   - 200-299：渲染同步（RenderSystem）
   - 300+：清理（CleanupSystem）

---

## 八、World API 速查

```ts
// Entity
const entity = world.createEntity();
world.removeEntity(entity);
world.isEntityAlive(entity);

// Component
world.registerComponent(PosComponent, 0);
const pos = world.addComp(entity, PosComponent);
pos.pos.x = 100;
world.removeComp(entity, PosComponent);
world.getComp(entity.id, PosComponent);
world.hasComp(entity, PosComponent);

// System
world.registerSystem(new MoveSystem(), 0);
world.getSystem(MoveSystem);

// Query（在 System.update 内使用）
const entities = this.world.query(PosComponent, VelocityComponent);
for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    const pos = this.world.getComp(eid, PosComponent);
    const vel = this.world.getComp(eid, VelocityComponent);
    pos.pos.x += vel.velocity * dt;
}
```

---

## 九、后续可扩展方向

- **FixedUpdate**：在 World 中加固定时间步长的 tick，物理相关 System 放在里面
- **事件系统集成**：System 之间通过 EventManager 通信，解耦跨 System 逻辑
- **对象池扩展**：ComponentArray 也可以做对象池，避免频繁 new
- **Query 缓存**：如果每帧 query 参数不变，可以缓存结果避免重复遍历
