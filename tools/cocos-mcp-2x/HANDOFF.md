# cocos-mcp-2x 交接文档

> 最后更新：2026-11-03 20:26，版本 **v0.2.2**
> 源码：`G:/unfinishWork-main/tools/cocos-mcp-2x/`
> 部署：`~/.CocosCreator/packages/cocos-mcp-2x/`（全局扩展，所有 2.x 项目共用）

---

## 一、现在是什么状态

| 项 | 值 |
|---|---|
| 版本 | 0.2.2 |
| 工具数 | 8 → **12** |
| 代码规模 | main.js 1457 行 / test.js 419 行 / reload.js 145 行 |
| 回归 | bottle_new、PinGame、cleanMaster 各 **27/27** |
| 服务 | `http://127.0.0.1:25900/mcp`（首个打开的项目占 25900，其余递增） |
| 场景写入 | ❌ 仍然只读 |

**本轮解决的问题**：AI 之前在 2.x 项目里"看不见代码"。只能逐个 `read_file`，不知道哪个文件引用了什么；场景里的脚本组件是个 `9cf68pd0RRKz4xKnLMxHv7Z`，不知道是谁。现在这两件事都通了。

---

## 二、12 个工具速查

| 工具 | 参数 | 说明 |
|---|---|---|
| `get_project_info` | — | 路径、版本、场景列表、资源数、当前端口 |
| `list_dir` | `path` | 列目录 |
| `search_files` ⭐ | `pattern` `path` `glob` `context` `maxResults` `useRegex` `ignoreCase` `includeMeta` | 全文搜索。默认字面量匹配（不解析正则），默认跳过 `.meta` |
| `read_file` | `path` | 文本文件，>4MB 拒绝 |
| `write_file` | `path` `content` | 自动建目录，写 `.fire` 后要 `refresh_assets` |
| `query_scene_tree` ⭐ | `path` `maxDepth` `node` | 节点树；脚本组件自动带 `script` + `className`；可按节点路径取子树 |
| `read_scene_node` ⭐ | `path` `node` `depth` | 单节点完整序列化值，引用翻译成名字/路径 |
| `resolve_uuid` ⭐ | `uuid` | 完整 uuid / 23 位压缩 uuid / 资源路径，三者互转 |
| `get_editor_log` | `lines` `keyword` `level` | 日志末尾；只读末尾 2MB，不会整读 |
| `execute_script` | `code` | 主进程跑 JS，可访问 `Editor` / `require`，**支持 await** |
| `refresh_assets` | `path` | 重新导入，会等 assetdb 回调完成 |
| `list_open_projects` ⭐ | — | 本机所有 2.x 项目 + 端口（读端口注册表） |

⭐ = v0.2 新增或有实质增强。

### 几个反直觉的返回值

- `search_files` 返回 `totalMatches`（真实命中总数）和 `returned`（实际返回条数）。
  `truncated` 只在 `totalMatches > returned` 时为 true，**不要**用 `totalMatches === maxResults` 判断。
- `query_scene_tree` 的 `node` 参数支持 `"Canvas/bottomUI"`、纯数字 id、或全树唯一的名字；路径首段 `Scene` 可省。
- `read_scene_node` 里 `__id__` 已被翻译成 `{__id__, __type__, __name__}`，`__uuid__` 翻成 `{__uuid__, __path__, __missing__}`。

---

## 三、架构：三个层次，刻意分开

```
文件层     safePath / walkFiles / readTail            只管读写，所有路径锁在项目内
解析层     loadSerialized / expandNode / dumpProps     只管 .fire 结构，不碰编辑器
uuid 层    compressUuid / buildUuidIndex               只管 uuid ↔ 路径
协议层     handleRpc / tools/call                      Promise 化，返回值可能是 Promise
```

**为什么不用编辑器 API 读场景**：2.x 的 `.fire` 是纯 JSON 数组 + `__id__` 下标引用，直接解析比走 IPC 可靠、能 diff、还能离线测。这个原则在 v0.2 仍然成立——但**写**场景时可能要破例，见第七节。

---

## 四、核心技术点（下次改动前必须懂）

### 1. 压缩 uuid

`.fire` 里脚本组件的 `__type__` 不是类名，是压缩 uuid。规则：

```
32 位 hex → 保留前 5 位 → 剩下 27 位每 3 个（12 bit）拆成 2 个 base64 字符 → 共 23 字符
```

```js
function compressUuid(uuid) {
    var hex = String(uuid).replace(/-/g, '');
    var out = hex.slice(0, 5);
    for (var i = 5; i < 32; i += 3) {
        var num = parseInt(hex.substr(i, 3), 16);
        out += BASE64_KEYS.charAt(num >> 6) + BASE64_KEYS.charAt(num & 63);
    }
    return out;
}
```

**已用真实数据校验**：`9cf68pd0RRKz4xKnLMxHv7Z` ↔ `assets/game/scripts/AppStart.ts`。
test.js 里有一条断言专门比对"压缩结果 === 场景里的 `__type__`"，算法错一个 bit 就会挂。

### 2. uuid 索引

扫 `assets/**/*.meta`，建 `byFull[uuid] = 相对路径` + `byShort[压缩uuid] = uuid`。
缓存 30 秒；`refresh_assets` 会强制失效（`uuidCache.time = 0`）。

规模参考：bottle_new 539、PinGame 569、cleanMaster 4086，都很快。

### 3. 节点查找

`findNode(arr, rootId, ref)` 三级兜底：纯数字当数组下标 → 按 `/` 拆路径逐层比 `_name` → 全树搜唯一名字。
`cc.Scene` 没有 `_name`，正常路径是 `Scene/Canvas/...`，首段 `Scene` 会被识别并跳过。

### 4. 引用翻译

`dumpProps` 递归时遇到 `{__id__}` / `{__uuid__}` 就替换成可读形式，`PROP_SKIP` 过滤掉 `node`、`_objFlags`、`_id`、`_name`、`_prefab`、`_enabled`、`_scene`。

---

## 五、开发工作流

```bash
cd G:/unfinishWork-main/tools/cocos-mcp-2x

# 1. 改 main.js 后先跑测试（不需要编辑器，mock 掉 Editor 后真发 HTTP）
node test.js "G:/CocosProject/new/bottle_new"

# 2. 部署到编辑器扩展目录
cp main.js package.json test.js reload.js ~/.CocosCreator/packages/cocos-mcp-2x/

# 3. 热重载（不用重启编辑器）
node reload.js 25900
```

### 热重载为什么是这么实现的

`Editor.Package.reload('cocos-mcp-2x')` 在 2.4 上**无效**：`Editor.Package.packageInfo()` 返回 null，
`main.js` 也不在 `require.cache` 里（扩展加载器不走标准 require 注册）。

所以 `reload.js` 改走自举：关掉自己 25900~25910 的监听 → 清 `require.cache` → `require` 新代码 → `load()`。

**两个必踩的坑（已经踩过，别再踩）**：

1. `require.cache` 的键在 Windows 上是**反斜杠**，而 `Editor.Package.paths` 给的是正斜杠拼接。
   直接 `indexOf` 匹配不到 → 缓存清不掉 → `require` 拿回旧模块 → 看起来"重载成功"但版本没变。
   必须两边都 normalize。
2. `server.close()` **不会断开已建立的 keep-alive 连接**。客户端（Node 19+ 默认开 keepAlive）
   复用旧 socket，会一直读到那个已经"关掉"的旧实例。判断换没换实例要给请求加
   `agent: false` + `Connection: close`，并且比对 `serverInfo.instanceId`——
   **不要用 version 判断**，只改实现不改版本号时它不变。

---

## 六、已知限制

1. **多项目端口**：端口仍会递增（25900/25901/…）。`list_open_projects` 能查清谁在哪个端口，
   但 `mcp.json` 里的 URL 还是要手改。没做 broker——MCP 协议不支持按项目路由。
2. **mcp.json 登记后不立即生效**：客户端是在会话启动时做服务发现的。已登记
   `"cocos-mcp-2x": { "type": "http", "url": "http://127.0.0.1:25900/mcp" }`，
   但**要重启客户端或新开会话**才会出现在工具列表里。在那之前只能 curl 直连。
3. **场景只读**，见第七节。
4. **脚本被删的情况**：`__type__` 查不到 `.meta` 时，组件会带
   `note: "该 uuid 不在 assets 的 .meta 索引里..."`，`script` 为 null，不是 bug。
5. **`execute_script` 无超时保护**：async 支持了，但用户代码里 `await` 一个永不 resolve 的
   Promise 会把请求挂死（HTTP 层没有设超时）。
6. **日志路径不固定**：2.4 可能写 `~/.CocosCreator/log/`，也可能写 `logs/CocosCreator.log`。
   已改成两个都扫、取 mtime 最新的。之前只扫 `log/`，在 bottle_new 上读到的是 7 个月前的旧文件。

---

## 七、下一步：场景写入（需要先做决定）

这是唯一的架构岔路，而且和"不碰编辑器 IPC"的原始原则冲突，**下个会话开始前先定这个**。

| 方案 | 做法 | 优点 | 风险 |
|---|---|---|---|
| **A. JSON patch** | 在 `.fire` 数组追加对象、重排 `__id__` | 符合现有原则、可 diff、无头可用、能离线测 | 每个节点要手搓 `_id`/`_trs`/`_layer`/`_opacity`/`_color` 全套；写错 = 编辑器打开崩或静默丢节点 |
| **B. `Editor.Scene.callSceneScript`** | 在场景进程跑，直接 `new cc.Node()` / `addComponent` | 序列化由引擎保证，正确率高；还能读运行时状态 | 要加 `scene-script` 声明；多一个进程边界；异步链路 |
| **C. 双通道** | B 优先，失败降级 A | 符合一贯的 D1/D2/D3 降级思路 | 两套都要维护 |

**建议：先做 C 的最小验证**，不要直接铺完整写接口：

1. 在 `package.json` 加 `"scene-script": "scene.js"`，写一个 `addNode(parentPath, name)` 方法；
2. 用 `Editor.Scene.callSceneScript('cocos-mcp-2x', 'addNode', ...)` 往 bottle_new 的 Canvas 下加空节点；
3. 存盘 → 用 `query_scene_tree` 读回确认；
4. 通了再铺 `scene_add_node` / `scene_remove_node` / `scene_set_property`。

失败就退回 A，先只支持"加空节点"这一种最简操作，跑通再扩展。

### 另一件事：FairyGUI 包解析

bottle_new 的 `Game.fire` 里只有 `fgui` 这个挂载点，真实 UI 在 `assets/game/packages/`。
下个会话如果要推进这块，先看 `AppStart.ts` 里的 `resMap: Map<number, number>`——
可能是包索引映射，值得先读一遍再决定解析策略（FairyGUI 导出的是二进制 `.fui`/`.bin` + 图集，不是 JSON）。

---

## 八、验收基线

改完任何东西，跑这三条，必须全绿（各 27 项）：

```bash
node test.js "G:/CocosProject/new/bottle_new"    # 539 资源 / Game.fire 15 对象 7 节点
node test.js "D:/CocosProject/PinGame"           # 569 资源 / 20 对象 9 节点
node test.js "D:/CocosProject/cleanMaster"       # 4086 资源 / 47 对象 18 节点
```

v0.1 的测试是在 PinGame / cleanMaster 上写的（各 15 项），v0.2 扩到 27 项并且三个项目都跑过。
`test.js` 里已经设了 `COCOS_MCP_NO_REGISTRY=1`，**不会**污染端口注册表——别删这行，
否则测试进程和真编辑器同项目名会互相覆盖。

---

## 九、端口注册表

每个项目启动时写 `~/.CocosCreator/cocos-mcp-2x/ports/<项目名>.json`：

```json
{ "name": "bottle_new", "project": "G:\\CocosProject\\new\\bottle_new",
  "port": 25900, "pid": 37336, "startedAt": "2026-11-03T12:21:32.036Z" }
```

卸载时删掉。编辑器菜单 `扩展/Cocos MCP 2.x/` 下有三个入口：
状态与端口、列出已打开项目、重启服务。

> 注意：`重启服务` 走的是 `stopServer` + `startServer`，**不会**重新加载代码。
> 要换代码还是得用 `node reload.js`。
