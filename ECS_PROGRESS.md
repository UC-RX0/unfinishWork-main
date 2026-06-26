# ECS 框架开发进度

> 最后更新：2026-06-26

## 项目背景
Cocos Creator 游戏项目，从零搭建数据导向 ECS 框架。目标：类似吸血鬼幸存者的游戏（支持多玩家同屏）。

## 三层架构
```
抽象接口层    IWorld       ISystem       ← 定义契约，解耦依赖
               ↕            ↕
编排层        World  ←→  SystemManager   ← 实现接口，协调调度
               ↕
管理层        ComponentManager           ← 封装底层，提供 CRUD + query
               ↕
底层          BitSet    ComponentArray    EntityPool   ← 纯数据结构和算法
```

## 每帧数据流
```
摇杆 Touch
  ↓ JoyStickManager.onTouchMove()
  ↓ convertToNodeSpaceAR → 计算方向+强度
inputMgr.setInput(0, dir, speed)
  ↓
InputSystem（priority 0）
  ↓ query(PlayerInputComponent, VelocityComponent)
  ↓ playerIndex → inputMgr.getInput(playerIndex)
  ↓ 写 vel.direction, vel.speed
MoveSystem（priority 100）
  ↓ query(PosComponent, VelocityComponent)
  ↓ pos += direction * speed * dt
PosSynSystem（priority 200）
  ↓ query(PosComponent, ViewComponent)
  ↓ node.setPosition(pos)
Cocos 渲染
```

## 当前进度
```
✅ BitSet → ✅ Entity → ✅ ComponentArray → ✅ ComponentManager
✅ ISystem → ✅ SystemManager → ✅ World
✅ MoveSystem → ✅ InputSystem → ✅ PosSynSystem
🚧 JoyStickManager（用户正在自己写）
⏳ World 初始化流程（注册组件、System、创建玩家实体）
⏳ 跑通完整流程
```

## 关键设计决策
- Entity 改 interface：纯标识，零开销，无需 new，ID 复用由 EntityPool 管理
- SoA 存储：ComponentArray = Map<entityId, T>，每种组件一个 Map
- BitSet 签名匹配：entity 的组件组合用 BitSet 表示，query 只查 entitySignature
- ISystem → IWorld 接口，避免循环依赖
- ECS 方法用 addComp/getComp，避免与 Cocos Component 基类冲突
- 混合注册：addComponent 自动注册未注册的组件类型
- ComponentManager 持有 query，数据私有，World 只委托
- SystemManager 只在 length>1 时才排序
- 输入架构：InputManager（外部单例） + PlayerInputComponent（标记） + InputSystem（ECS内部）
- 玩家通过组件组合区分：PlayerInputComponent + VelocityComponent + PosComponent

## Cocos 注意事项
- `event.getUILocation()` 返回 Canvas 设计分辨率坐标（非设备像素）
- `convertToNodeSpaceAR` 世界坐标 → 节点本地坐标
- `Vec2.normalize()` 返回新对象，不修改原对象！需要用返回值

## 待办清单
### 近期
1. JoyStickManager 完成 — 摇杆方向写入 InputManager
2. World 初始化 — 注册所有 Component + System，创建玩家实体
3. 跑通流程 — 摇杆 → 移动 → 渲染

### 日后优化
1. Component 改 interface — 像 Entity 一样消灭 class，需要工厂函数
2. SoA.ts — ComponentArray 基类，TypedArray 替代 Map
3. Component 对象池
4. Query 缓存
5. 多玩家网络同步
