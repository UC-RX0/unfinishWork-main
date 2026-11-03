'use strict';

/**
 * Cocos Creator 2.x MCP Server
 *
 * 为什么 2.x 要单独写一个：
 *   1. 扩展 API 是老的（main-menu / panel），3.x 的 contributions 在 2.x 不认
 *   2. 2.x 没有内嵌 Game 面板，任何"在编辑器里操作游戏画面"的设计都不成立
 *   3. 但 2.x 的 .fire / .prefab 是纯 JSON —— 文件层能做的事比编辑器 API 还多
 *
 * 设计原则：不碰编辑器私有 IPC。
 *   场景读写走 .fire 的 JSON 解析，资源刷新走 Editor.assetdb，
 *   其余全部走文件系统。这样跨 2.3 / 2.4 都能用，也不会因为编辑器内部
 *   消息名变化而失效。
 *
 * 兼容性：Cocos Creator 2.4 内置 Node 版本较老，
 *   本文件刻意不使用 ?. / ?? / Array.flat 等新语法。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_NAME = 'cocos-mcp-2x';
const LOG = '[' + PKG_NAME + ']';
const BASE_PORT = 25900;
const PORT_RETRY = 10;
const MAX_READ_BYTES = 4 * 1024 * 1024;

var server = null;
var listeningPort = 0;

//#region 基础工具

/** 当前项目根目录 */
function projectRoot() {
    if (typeof Editor !== 'undefined' && Editor.Project && Editor.Project.path) {
        return Editor.Project.path;
    }
    return null;
}

/**
 * 把相对路径解析成项目内的绝对路径，并阻断越界访问。
 * 这是唯一的安全边界：AI 只能在项目目录里读写。
 */
function safePath(rel) {
    var root = projectRoot();
    if (!root) throw new Error('项目未打开，拿不到 Editor.Project.path');
    var abs = path.resolve(root, rel || '.');
    var rootNorm = path.resolve(root);
    // Windows 大小写不敏感，统一转小写比较
    var a = process.platform === 'win32' ? abs.toLowerCase() : abs;
    var b = process.platform === 'win32' ? rootNorm.toLowerCase() : rootNorm;
    if (a !== b && a.indexOf(b + path.sep) !== 0) {
        throw new Error('路径越界：' + rel + ' 不在项目目录内');
    }
    return abs;
}

function relPath(abs) {
    var root = projectRoot();
    if (!root) return abs;
    return path.relative(root, abs).split(path.sep).join('/');
}

function statSafe(abs) {
    try {
        return fs.statSync(abs);
    } catch (e) {
        return null;
    }
}

/** 编辑器日志目录里最新的那个文件 */
function latestEditorLog() {
    var dir = path.join(os.homedir(), '.CocosCreator', 'log');
    var files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return null;
    }
    var best = null;
    var bestTime = 0;
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f.indexOf('.txt') < 0 && f.indexOf('.log') < 0) continue;
        var full = path.join(dir, f);
        var st = statSafe(full);
        if (st && st.isFile() && st.mtimeMs > bestTime) {
            bestTime = st.mtimeMs;
            best = full;
        }
    }
    return best;
}

//#endregion

//#region .fire / .prefab 解析

/**
 * 解析 Cocos 序列化文件（.fire / .prefab）。
 * 格式是一维数组 + __id__ 下标引用，根对象通常在 0 或 1 号位。
 */
function loadSerialized(absPath) {
    var raw = fs.readFileSync(absPath, 'utf8');
    var arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error('不是 Cocos 序列化格式（顶层不是数组）');
    return arr;
}

/** 找出根节点下标：SceneAsset.scene 或 Prefab.data，兜底 0 */
function findRootIndex(arr) {
    for (var i = 0; i < arr.length; i++) {
        var o = arr[i];
        if (!o || typeof o !== 'object') continue;
        if (o.__type__ === 'cc.SceneAsset' && o.scene && typeof o.scene.__id__ === 'number') {
            return o.scene.__id__;
        }
        if (o.__type__ === 'cc.Prefab' && o.data && typeof o.data.__id__ === 'number') {
            return o.data.__id__;
        }
    }
    for (var j = 0; j < arr.length; j++) {
        if (arr[j] && arr[j].__type__ === 'cc.Scene') return j;
        if (arr[j] && arr[j].__type__ === 'cc.Node') return j;
    }
    return 0;
}

/** 从 _trs 里取位置（格式是 [x,y,z, qx,qy,qz,qw, sx,sy,sz]） */
function readTRS(obj) {
    if (!obj || !obj._trs || !obj._trs.array) return null;
    var a = obj._trs.array;
    return { x: a[0], y: a[1], z: a[2] };
}

/** 递归展开节点树 */
function expandNode(arr, id, depth, maxDepth) {
    if (depth > maxDepth) return { truncated: true };
    var obj = arr[id];
    if (!obj) return null;

    var node = {
        id: id,
        type: obj.__type__,
        // cc.Scene 本身没有 _name，用类型兜底，否则 AI 看到的是 undefined
        name: obj._name || (obj.__type__ === 'cc.Scene' ? 'Scene' : ''),
        active: obj._active,
        position: readTRS(obj),
        components: [],
        children: []
    };

    if (obj._contentSize) {
        node.size = { width: obj._contentSize.width, height: obj._contentSize.height };
    }

    var comps = obj._components || [];
    for (var i = 0; i < comps.length; i++) {
        var cid = comps[i] && comps[i].__id__;
        var comp = arr[cid];
        if (!comp) continue;
        // 自定义脚本组件的 __type__ 是压缩后的 uuid，不是类名。
        // 标出来，避免 AI 把它当成引擎内置组件。
        var isScript = String(comp.__type__).indexOf('cc.') !== 0;
        node.components.push({
            id: cid,
            type: comp.__type__,
            isScript: isScript,
            enabled: comp._enabled !== false
        });
    }

    var kids = obj._children || [];
    for (var k = 0; k < kids.length; k++) {
        var kid = kids[k] && kids[k].__id__;
        var child = expandNode(arr, kid, depth + 1, maxDepth);
        if (child) node.children.push(child);
    }

    return node;
}

function countNodes(node) {
    var n = 1;
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) {
        if (!kids[i].truncated) n += countNodes(kids[i]);
    }
    return n;
}

//#endregion

//#region 工具实现

var TOOLS = [
    {
        name: 'get_project_info',
        description: '获取当前 Cocos Creator 2.x 项目的基本信息：项目路径、引擎版本、场景文件列表。任何操作前先调这个确认上下文。',
        inputSchema: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'list_dir',
        description: '列出项目内某个目录的内容。返回文件名、是否目录、大小。用于在读写前摸清结构。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的路径，如 assets/scene，默认 "."' }
            },
            required: []
        }
    },
    {
        name: 'read_file',
        description: '读取项目内文本文件的内容。超过 4MB 会拒绝，避免把二进制资源读爆。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的路径' }
            },
            required: ['path']
        }
    },
    {
        name: 'write_file',
        description: '写入项目内文本文件，目录不存在会自动创建。用于改代码、改 .fire / .prefab 的 JSON。写 .fire 后需要调用 refresh_assets 让编辑器重新导入。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的路径' },
                content: { type: 'string', description: '完整文件内容' }
            },
            required: ['path', 'content']
        }
    },
    {
        name: 'query_scene_tree',
        description: '解析 .fire 场景文件或 .prefab 预制体，返回节点树：名称、层级、位置、尺寸、挂载的组件类型。用 list_dir 先找到文件再调这个。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的 .fire 或 .prefab 路径' },
                maxDepth: { type: 'number', description: '最大展开层级，默认 20' }
            },
            required: ['path']
        }
    },
    {
        name: 'get_editor_log',
        description: '读取编辑器最新的日志文件末尾若干行。AI 改完代码后用它确认有没有编译错误、资源报错。',
        inputSchema: {
            type: 'object',
            properties: {
                lines: { type: 'number', description: '读取末尾多少行，默认 80，最大 500' }
            },
            required: []
        }
    },
    {
        name: 'execute_script',
        description: '在扩展主进程里执行一段 JavaScript，可以访问全局 Editor 和 require。万能兜底工具：当成普通函数体写，要返回结果就写 return。仅支持同步代码。',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: '要执行的代码，可含 return' }
            },
            required: ['code']
        }
    },
    {
        name: 'refresh_assets',
        description: '让编辑器重新导入资源。改完 .fire / .prefab / 图片或新增文件后必须调用，否则编辑器看不到变化。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'db:// 开头的资源路径，默认 db://assets/' }
            },
            required: []
        }
    }
];

function toolGetProjectInfo() {
    var root = projectRoot();
    if (!root) throw new Error('项目未打开');

    var info = { path: root, name: path.basename(root) };

    // 版本信息在 project.json 里
    var pj = path.join(root, 'project.json');
    if (statSafe(pj)) {
        try {
            var p = JSON.parse(fs.readFileSync(pj, 'utf8'));
            info.version = p.version;
            info.engine = p.engine;
        } catch (e) { /* 读不到就算了 */ }
    }

    // 场景列表
    info.scenes = [];
    var sceneDir = path.join(root, 'assets');
    if (statSafe(sceneDir)) {
        info.scenes = findFiles(sceneDir, '.fire', 3);
    }

    info.mcpPort = listeningPort;
    return info;
}

function findFiles(dir, ext, maxDepth) {
    var out = [];
    var stack = [{ d: dir, depth: 0 }];
    while (stack.length) {
        var cur = stack.pop();
        if (cur.depth > maxDepth) continue;
        var items;
        try {
            items = fs.readdirSync(cur.d);
        } catch (e) {
            continue;
        }
        for (var i = 0; i < items.length; i++) {
            var name = items[i];
            var full = path.join(cur.d, name);
            var st = statSafe(full);
            if (!st) continue;
            if (st.isDirectory()) {
                stack.push({ d: full, depth: cur.depth + 1 });
            } else if (name.toLowerCase().slice(-ext.length) === ext) {
                out.push(relPath(full));
            }
        }
    }
    return out;
}

function toolListDir(args) {
    var abs = safePath(args.path || '.');
    var st = statSafe(abs);
    if (!st) throw new Error('目录不存在：' + args.path);
    if (!st.isDirectory()) throw new Error('不是目录：' + args.path);

    var items = fs.readdirSync(abs);
    var out = [];
    for (var i = 0; i < items.length; i++) {
        var name = items[i];
        var full = path.join(abs, name);
        var s = statSafe(full);
        if (!s) continue;
        out.push({
            name: name,
            dir: s.isDirectory(),
            size: s.isDirectory() ? 0 : s.size
        });
    }
    out.sort(function (a, b) {
        if (a.dir !== b.dir) return a.dir ? -1 : 1;
        return a.name < b.name ? -1 : 1;
    });
    return { path: relPath(abs), count: out.length, items: out };
}

function toolReadFile(args) {
    if (!args.path) throw new Error('缺少 path');
    var abs = safePath(args.path);
    var st = statSafe(abs);
    if (!st) throw new Error('文件不存在：' + args.path);
    if (st.isDirectory()) throw new Error('这是目录不是文件：' + args.path);
    if (st.size > MAX_READ_BYTES) {
        throw new Error('文件过大（' + Math.round(st.size / 1024) + 'KB），拒绝读取');
    }
    return fs.readFileSync(abs, 'utf8');
}

function toolWriteFile(args) {
    if (!args.path) throw new Error('缺少 path');
    if (typeof args.content !== 'string') throw new Error('content 必须是字符串');
    var abs = safePath(args.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, args.content, 'utf8');
    var st = statSafe(abs);
    return {
        path: relPath(abs),
        bytes: st ? st.size : args.content.length,
        hint: abs.slice(-5) === '.fire' || abs.slice(-7) === '.prefab'
            ? '已写入，调用 refresh_assets 让编辑器重新导入'
            : '已写入'
    };
}

function toolQuerySceneTree(args) {
    if (!args.path) throw new Error('缺少 path');
    var abs = safePath(args.path);
    if (!statSafe(abs)) throw new Error('文件不存在：' + args.path);

    var arr = loadSerialized(abs);
    var rootId = findRootIndex(arr);
    var maxDepth = typeof args.maxDepth === 'number' ? args.maxDepth : 20;
    var tree = expandNode(arr, rootId, 0, maxDepth);

    return {
        path: relPath(abs),
        totalObjects: arr.length,
        nodeCount: tree ? countNodes(tree) : 0,
        tree: tree
    };
}

function toolGetEditorLog(args) {
    var n = typeof args.lines === 'number' ? args.lines : 80;
    if (n < 1) n = 80;
    if (n > 500) n = 500;

    var abs = latestEditorLog();
    if (!abs) return '（找不到编辑器日志文件）';

    var text = fs.readFileSync(abs, 'utf8');
    var all = text.split(/\r?\n/);
    var tail = all.slice(Math.max(0, all.length - n));

    return '文件：' + abs + '\n总行数：' + all.length + '\n--- 末尾 ' + tail.length + ' 行 ---\n' + tail.join('\n');
}

function toolExecuteScript(args) {
    if (!args.code) throw new Error('缺少 code');
    var fn;
    try {
        fn = new Function('Editor', 'require', args.code);
    } catch (e) {
        throw new Error('语法错误：' + e.message);
    }
    var result = fn(typeof Editor !== 'undefined' ? Editor : null, require);
    return {
        result: typeof result === 'undefined' ? null : result,
        type: typeof result
    };
}

function toolRefreshAssets(args) {
    var dbPath = args.path || 'db://assets/';
    if (typeof Editor === 'undefined' || !Editor.assetdb) {
        throw new Error('Editor.assetdb 不可用');
    }
    Editor.assetdb.refresh(dbPath);
    return { refreshed: dbPath };
}

function callTool(name, args) {
    args = args || {};
    switch (name) {
        case 'get_project_info': return toolGetProjectInfo();
        case 'list_dir': return toolListDir(args);
        case 'read_file': return toolReadFile(args);
        case 'write_file': return toolWriteFile(args);
        case 'query_scene_tree': return toolQuerySceneTree(args);
        case 'get_editor_log': return toolGetEditorLog(args);
        case 'execute_script': return toolExecuteScript(args);
        case 'refresh_assets': return toolRefreshAssets(args);
        default: throw new Error('未知工具：' + name);
    }
}

//#endregion

//#region MCP 协议

function rpcResult(id, result) {
    return { jsonrpc: '2.0', id: id, result: result };
}

function rpcError(id, code, message) {
    return { jsonrpc: '2.0', id: id, error: { code: code, message: message } };
}

function handleRpc(msg) {
    var id = msg.id;
    var method = msg.method;

    // 通知类消息没有 id，不需要回复
    if (id === undefined || id === null) return null;

    if (method === 'initialize') {
        return rpcResult(id, {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: PKG_NAME, version: '0.1.0' },
            instructions: 'Cocos Creator 2.x 项目操作入口。文件读写限制在项目目录内。改完 .fire/.prefab 记得 refresh_assets。'
        });
    }

    if (method === 'tools/list') {
        return rpcResult(id, { tools: TOOLS });
    }

    if (method === 'tools/call') {
        var params = msg.params || {};
        var name = params.name;
        var args = params.arguments || {};
        try {
            var out = callTool(name, args);
            var text = typeof out === 'string' ? out : JSON.stringify(out, null, 2);
            return rpcResult(id, { content: [{ type: 'text', text: text }] });
        } catch (e) {
            return rpcResult(id, {
                content: [{ type: 'text', text: '错误：' + (e && e.message ? e.message : String(e)) }],
                isError: true
            });
        }
    }

    if (method === 'ping') {
        return rpcResult(id, {});
    }

    return rpcError(id, -32601, '未实现的方法：' + method);
}

//#endregion

//#region HTTP 服务

function startServer(port, attempt) {
    attempt = attempt || 0;
    if (attempt >= PORT_RETRY) {
        Editor.error(LOG, '端口 ' + BASE_PORT + '~' + (BASE_PORT + PORT_RETRY) + ' 都被占用，服务启动失败');
        return;
    }

    var s = http.createServer(function (req, res) {
        // 只接受 POST /mcp
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
            return;
        }

        var body = '';
        req.on('data', function (chunk) {
            body += chunk;
            // 防止超大请求打爆内存
            if (body.length > 8 * 1024 * 1024) {
                req.destroy();
            }
        });

        req.on('end', function () {
            var msg;
            try {
                msg = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rpcError(null, -32700, 'JSON 解析失败')));
                return;
            }

            var reply;
            try {
                reply = handleRpc(msg);
            } catch (e) {
                reply = rpcError(msg.id, -32603, e && e.message ? e.message : String(e));
            }

            // 通知类消息返回 202 空体
            if (reply === null) {
                res.writeHead(202);
                res.end();
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(reply));
        });
    });

    s.on('error', function (err) {
        if (err && err.code === 'EADDRINUSE') {
            Editor.warn(LOG, '端口 ' + port + ' 被占用，尝试 ' + (port + 1));
            startServer(port + 1, attempt + 1);
        } else {
            Editor.error(LOG, '服务异常：' + (err && err.message));
        }
    });

    s.listen(port, '127.0.0.1', function () {
        server = s;
        listeningPort = port;
        Editor.success(LOG, 'MCP 已启动 → http://127.0.0.1:' + port + '/mcp');
        Editor.log(LOG, '项目：' + projectRoot());
        Editor.log(LOG, '把这行加进 ~/.workbuddy/mcp.json：');
        Editor.log(LOG, '  "cocos-mcp-2x": { "type": "http", "url": "http://127.0.0.1:' + port + '/mcp" }');
    });
}

function stopServer() {
    if (!server) return;
    try {
        server.close();
    } catch (e) { /* 忽略 */ }
    server = null;
    listeningPort = 0;
}

//#endregion

module.exports = {

    load: function () {
        Editor.log(LOG, '扩展加载中，项目路径 = ' + projectRoot());
        startServer(BASE_PORT);
    },

    unload: function () {
        stopServer();
        Editor.log(LOG, '扩展已卸载，服务已停止');
    },

    messages: {

        'status': function () {
            if (server && listeningPort) {
                Editor.log(LOG, '运行中 → http://127.0.0.1:' + listeningPort + '/mcp');
                Editor.log(LOG, '配置片段：');
                Editor.log(LOG, '  "cocos-mcp-2x": { "type": "http", "url": "http://127.0.0.1:' + listeningPort + '/mcp" }');
            } else {
                Editor.warn(LOG, '未运行');
            }
        },

        'restart': function () {
            Editor.log(LOG, '正在重启服务…');
            stopServer();
            setTimeout(function () {
                startServer(BASE_PORT);
            }, 300);
        }
    }
};
