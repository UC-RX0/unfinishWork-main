# headless 测试环境

在 **Node 里**跑真实的 ECS 逻辑，不需要打开 Cocos 编辑器。
目的：确定性与联机的回归测试可以随时跑，不受编辑器崩溃、预览卡顿影响。

## 组成

```
tools/headless/
├── cc-stub.d.ts        引擎的类型桩（让 TS 编译得过）
├── tsconfig.json       把 assets/Script/game + core 编成 CommonJS
├── stub/
│   ├── cc.js           引擎运行时桩（Vec2/Vec3/Node/Sprite/...）
│   ├── resbridge.js    资源层桩（返回假序列帧与假节点）
│   └── uimanager.js    UI 层桩（只提供层级节点，避免刷噪音）
├── run.js              单机测试：跑 N 帧，输出校验和与状态统计
├── net-client.js       联机客户端：连帧同步服务端，输出指定帧的校验和
└── net-test.js         端到端测试：起服务端 + 两个客户端，比对校验和
```

## 用法

先编译（把 game/core 编成 CommonJS）：

```bash
node "<Cocos>/resources/app.asar.unpacked/node_modules/typescript/bin/tsc" -p tools/headless/tsconfig.json
```

> Cocos 路径按你本机安装位置调整。
> 编译产物在 `temp/headless-build/`，属于缓存目录，会被 Cocos 清掉，重编即可。

### 单机：确定性 + 四态覆盖

```bash
node tools/headless/run.js 900 combat     # 脚本输入 + 持续射击
node tools/headless/run.js 900 idle       # 完全无输入
```

输出形如：

```json
{
  "mode": "combat",
  "frames": 900,
  "checksum": "666b2584",
  "states": "Idle=15,Move=66,Attack=59,Hit=7,Dead=7"
}
```

- 同一模式跑两次，`checksum` 必须一致 —— 这是确定性的回归基线
- `states` 五个计数都 > 0 才算怪物四态全部覆盖（脚本会自己断言并返回退出码）

### 联机：端到端帧同步

```bash
node tools/headless/net-test.js 900 600
```

自动起服务端 + 两个 headless 客户端，跑到第 600 帧比对校验和，
并检查服务端有没有报 desync。退出码 0 表示通过。

## 注意

- headless 里的资源是**假的**（假 SpriteFrame / 假节点），但**逻辑是真的**
  —— 跑的是和编辑器完全相同的 System 与 Component 代码
- 建实体走 `game/SceneBuilder.ts`，和编辑器预览共用同一套代码路径，
  所以 headless 测出来的结论对编辑器同样成立
- 桩的类型比真实引擎粗，`tsc` 会有几十条类型告警，属正常；
  工程本身的类型检查请用项目根目录的 `tsconfig.json`（`strict: false`）
