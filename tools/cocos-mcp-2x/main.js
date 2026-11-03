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
 *
 * v0.2 新增（解决"AI 看不懂项目"的问题）：
 *   - search_files   全文搜索，AI 读代码的刚需，之前只能逐个 read_file
 *   - resolve_uuid   uuid ↔ 资源路径双向解析
 *   - read_scene_node 单个节点的完整序列化值（@property 真实引用）
 *   - query_scene_tree 自动把脚本组件的压缩 uuid 还原成路径 + 类名
 *   - execute_script 支持 Promise，refresh_assets 等 assetdb 真回调
 *   - list_open_projects + 端口注册表，解决多项目端口递增连错项目
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_NAME = 'cocos-mcp-2x';
const VERSION = '0.2.2';
const LOG = '[' + PKG_NAME + ']';
const BASE_PORT = 25900;
const PORT_RETRY = 10;
const MAX_READ_BYTES = 4 * 1024 * 1024;
const MAX_SEARCH_BYTES = 2 * 1024 * 1024;
const MAX_LINE_CHARS = 400;
const UUID_CACHE_MS = 30000;

// 每次 load 生成一个新标识。热重载脚本靠它判断"到底换没换实例"，
// 比看 version 可靠：只改实现不改 VERSION 时版本号是不变的。
const INSTANCE_ID = Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);

var server = null;
var listeningPort = 0;

// 搜索时默认跳过的目录。library / temp / local 是编辑器产物，搜了只会刷屏
var SKIP_DIRS = {
    'node_modules': 1, '.git': 1, '.svn': 1, 'library': 1, 'temp': 1,
    'local': 1, 'build': 1, 'dist': 1, '.vscode': 1
};

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

/**
 * 找最新的编辑器日志。
 * 2.4 有两个目录：log/（单个会话的 editor-<ts>.txt）和 logs/（CocosCreator.log）。
 * 不同版本 / 不同安装哪边在写不固定，所以两个都扫，取 mtime 最新的那个。
 * v0.1 只扫了 log/，在 bottle_new 这台机器上读到的是 7 个月前的旧文件。
 */
function latestEditorLog() {
    var base = path.join(os.homedir(), '.CocosCreator');
    var dirs = [path.join(base, 'logs'), path.join(base, 'log')];
    var best = null;
    var bestTime = 0;

    for (var d = 0; d < dirs.length; d++) {
        var files;
        try {
            files = fs.readdirSync(dirs[d]);
        } catch (e) {
            continue;
        }
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f.indexOf('.txt') < 0 && f.indexOf('.log') < 0) continue;
            var full = path.join(dirs[d], f);
            var st = statSafe(full);
            if (st && st.isFile() && st.mtimeMs > bestTime) {
                bestTime = st.mtimeMs;
                best = full;
            }
        }
    }
    return best;
}

/**
 * 通用目录遍历。用显式栈而不是递归，避免超深目录爆栈。
 * onFile(full, name, stat) 返回 false 可中断遍历。
 */
function walkFiles(baseDir, opts, onFile) {
    opts = opts || {};
    var maxDepth = opts.maxDepth === undefined ? 30 : opts.maxDepth;
    var skip = opts.skip || {};
    var stack = [{ d: baseDir, depth: 0 }];
    while (stack.length) {
        var cur = stack.pop();
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
                if (skip[name]) continue;
                if (cur.depth + 1 <= maxDepth) stack.push({ d: full, depth: cur.depth + 1 });
            } else {
                if (onFile(full, name, st) === false) return;
            }
        }
    }
}

/** 只读文件末尾若干字节，避免把几百 MB 的日志整个读进内存 */
function readTail(abs, maxBytes) {
    var st = statSafe(abs);
    if (!st) return '';
    var start = Math.max(0, st.size - maxBytes);
    var len = st.size - start;
    if (len <= 0) return '';
    var fd;
    try {
        fd = fs.openSync(abs, 'r');
        var buf = Buffer.alloc(len);
        fs.readSync(fd, buf, 0, len, start);
        return buf.toString('utf8');
    } catch (e) {
        return '';
    } finally {
        if (fd !== undefined) {
            try { fs.closeSync(fd); } catch (e2) { /* 忽略 */ }
        }
    }
}

function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 简单 glob：* 不跨目录，** 跨目录，? 单字符 */
function globToRegExp(glob) {
    var g = String(glob).trim();
    var out = '';
    for (var i = 0; i < g.length; i++) {
        var c = g.charAt(i);
        if (c === '*') {
            if (g.charAt(i + 1) === '*') {
                out += '.*';
                i++;
            } else {
                out += '[^/\\\\]*';
            }
        } else if (c === '?') {
            out += '.';
        } else if ('\\^$.|+()[]{}'.indexOf(c) >= 0) {
            out += '\\' + c;
        } else {
            out += c;
        }
    }
    return new RegExp('^' + out + '$', 'i');
}

//#endregion

//#region uuid 索引

/**
 * Cocos 的"压缩 uuid"：32 位十六进制保留前 5 位，
 * 剩下 27 位每 3 个（12 bit）转成 2 个 base64 字符，总共 23 字符。
 * 场景文件里脚本组件的 __type__ 就是这个形态。
 */
var BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function compressUuid(uuid) {
    var hex = String(uuid).replace(/-/g, '');
    if (hex.length !== 32) return String(uuid);
    var out = hex.slice(0, 5);
    for (var i = 5; i < 32; i += 3) {
        var num = parseInt(hex.substr(i, 3), 16);
        out += BASE64_KEYS.charAt(num >> 6) + BASE64_KEYS.charAt(num & 63);
    }
    return out;
}

var uuidCache = { root: null, time: 0, byFull: {}, byShort: {} };

/**
 * 扫描 assets 下所有 .meta，建 uuid ↔ 路径索引。
 * 缓存 30 秒，refresh_assets 会强制失效。
 */
function buildUuidIndex(force) {
    var root = projectRoot();
    if (!root) throw new Error('项目未打开');
    var now = Date.now();
    if (!force && uuidCache.root === root && (now - uuidCache.time) < UUID_CACHE_MS) {
        return uuidCache;
    }

    var byFull = {};
    var byShort = {};
    var assetsDir = path.join(root, 'assets');
    var count = 0;

    walkFiles(assetsDir, { maxDepth: 40, skip: SKIP_DIRS }, function (full, name) {
        if (name.slice(-5) !== '.meta') return;
        var txt;
        try {
            txt = fs.readFileSync(full, 'utf8');
        } catch (e) {
            return;
        }
        var m = /"uuid"\s*:\s*"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"/.exec(txt);
        if (!m) return;
        var uuid = m[1];
        var assetRel = relPath(full.slice(0, -5)); // 去掉 ".meta"
        byFull[uuid] = assetRel;
        byShort[compressUuid(uuid)] = uuid;
        count++;
    });

    uuidCache = { root: root, time: now, byFull: byFull, byShort: byShort, count: count };
    return uuidCache;
}

function uuidToPath(uuid) {
    var idx = buildUuidIndex(false);
    var u = String(uuid || '').trim();
    if (idx.byFull[u]) return idx.byFull[u];
    // 传进来的是压缩形态
    if (idx.byShort[u] && idx.byFull[idx.byShort[u]]) return idx.byFull[idx.byShort[u]];
    return null;
}

/** 路径 → 完整 uuid（读同名 .meta） */
function pathToUuid(rel) {
    var abs = safePath(rel);
    var meta = abs + '.meta';
    if (!statSafe(meta)) return null;
    var txt;
    try {
        txt = fs.readFileSync(meta, 'utf8');
    } catch (e) {
        return null;
    }
    var m = /"uuid"\s*:\s*"([0-9a-fA-F-]{36})"/.exec(txt);
    return m ? m[1] : null;
}

var scriptInfoCache = {};

/**
 * 从脚本源码里捞类名。只做正则匹配，不引 TS 解析器——
 * 目标是"知道这个组件叫什么"，不是做语义分析。
 */
function readScriptInfo(rel) {
    var abs;
    try {
        abs = safePath(rel);
    } catch (e) {
        return null;
    }
    var st = statSafe(abs);
    if (!st) return null;
    var key = abs;
    var cached = scriptInfoCache[key];
    if (cached && cached.mtime === st.mtimeMs) return cached.info;

    var txt;
    try {
        txt = fs.readFileSync(abs, 'utf8');
    } catch (e) {
        return null;
    }

    var info = { path: rel, className: null, baseClass: null, ccclassName: null };
    var cls = /(?:export\s+default\s+|export\s+)?class\s+([A-Za-z_$][\w$]*)\s+extends\s+([\w$.]+)/.exec(txt);
    if (cls) {
        info.className = cls[1];
        info.baseClass = cls[2];
    }
    var cc = /@ccclass\s*\(\s*['"]([^'"]+)['"]\s*\)/.exec(txt);
    if (cc) info.ccclassName = cc[1];

    scriptInfoCache[key] = { mtime: st.mtimeMs, info: info };
    return info;
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

function readScaleTRS(obj) {
    if (!obj || !obj._trs || !obj._trs.array) return null;
    var a = obj._trs.array;
    if (a.length < 11) return null;
    return { x: a[7], y: a[8], z: a[9] };
}

function readRotationTRS(obj) {
    if (!obj || !obj._trs || !obj._trs.array) return null;
    var a = obj._trs.array;
    if (a.length < 11) return null;
    // 四元数转欧拉角没必要做，直接给 z 轴角度近似够 AI 判断
    var qz = a[5], qw = a[6];
    var angle = 2 * Math.atan2(qz, qw) * 180 / Math.PI;
    return Math.round(angle * 1000) / 1000;
}

/** 组件类型 → 脚本信息（压缩 uuid 反解） */
function describeComponentType(typeStr, idx) {
    var t = String(typeStr);
    if (t.indexOf('cc.') === 0) {
        return { isScript: false, script: null, className: null };
    }
    var fullUuid = idx.byShort[t] || null;
    var rel = fullUuid ? idx.byFull[fullUuid] : null;
    var info = rel ? readScriptInfo(rel) : null;
    return {
        isScript: true,
        uuid: fullUuid,
        script: rel,
        className: info ? info.className : null,
        resolved: !!rel
    };
}

/** 递归展开节点树 */
function expandNode(arr, id, depth, maxDepth, idx) {
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
        // v0.2 起自动反解成 assets 下的真实路径和类名。
        var desc = describeComponentType(comp.__type__, idx);
        var item = {
            id: cid,
            type: comp.__type__,
            isScript: desc.isScript,
            enabled: comp._enabled !== false
        };
        if (desc.isScript) {
            item.uuid = desc.uuid || null;
            item.script = desc.script || null;
            item.className = desc.className || null;
            if (!desc.resolved) {
                item.note = '该 uuid 不在 assets 的 .meta 索引里，可能是已删除的脚本或内置组件';
            }
        }
        node.components.push(item);
    }

    var kids = obj._children || [];
    for (var k = 0; k < kids.length; k++) {
        var kid = kids[k] && kids[k].__id__;
        var child = expandNode(arr, kid, depth + 1, maxDepth, idx);
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

/**
 * 按路径 / 下标 / 名字找节点。
 * 路径分隔用 /，允许带不带 "Scene" 根前缀。
 */
function findNode(arr, rootId, ref) {
    var s = String(ref === undefined || ref === null ? '' : ref).trim();
    if (!s) return null;

    // 纯数字当下标
    if (/^\d+$/.test(s)) {
        var id = parseInt(s, 10);
        if (arr[id] && (arr[id].__type__ === 'cc.Node' || arr[id].__type__ === 'cc.Scene')) return id;
    }

    var parts = s.split('/').filter(function (p) { return p.length > 0; });
    var rootObj = arr[rootId];
    if (parts.length && parts[0] === 'Scene' && rootObj && rootObj.__type__ === 'cc.Scene') {
        parts.shift();
    }

    if (parts.length === 0) return rootId;

    var cur = rootId;
    for (var i = 0; i < parts.length; i++) {
        var want = parts[i];
        var obj = arr[cur];
        if (!obj) return null;
        var kids = obj._children || [];
        var next = -1;
        for (var k = 0; k < kids.length; k++) {
            var kidId = kids[k] && kids[k].__id__;
            var kid = arr[kidId];
            if (kid && kid._name === want) { next = kidId; break; }
        }
        if (next < 0) return null;
        cur = next;
    }
    return cur;

}

/** 全树里按名字找，名字唯一才有意义 */
function findNodeByName(arr, rootId, name) {
    var hits = [];
    (function walk(id) {
        var o = arr[id];
        if (!o) return;
        if (o._name === name) hits.push(id);
        var kids = o._children || [];
        for (var i = 0; i < kids.length; i++) walk(kids[i] && kids[i].__id__);
    })(rootId);
    return hits.length === 1 ? hits[0] : (hits.length > 1 ? -hits.length : -1);
}

var PROP_SKIP = {
    node: 1, _objFlags: 1, _id: 1, _name: 1, _prefab: 1,
    __scriptAsset: 1, _enabled: 1, _scene: 1
};

/** 把序列化对象里的 __id__ / __uuid__ 引用翻译成人能看的东西 */
function dumpProps(arr, obj, depth, idx) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (depth < 0) return '[...]';
    if (Array.isArray(obj)) {
        var outA = [];
        for (var i = 0; i < obj.length; i++) outA.push(dumpProps(arr, obj[i], depth - 1, idx));
        return outA;
    }
    if (typeof obj.__id__ === 'number') {
        var t = arr[obj.__id__];
        return {
            __id__: obj.__id__,
            __type__: t && t.__type__,
            __name__: (t && t._name) || ''
        };
    }
    if (typeof obj.__uuid__ === 'string') {
        var p = idx.byFull[obj.__uuid__] || null;
        return { __uuid__: obj.__uuid__, __path__: p, __missing__: !p };
    }
    var out = {};
    for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (PROP_SKIP[k]) continue;
        out[k] = dumpProps(arr, obj[k], depth - 1, idx);
    }
    return out;
}

//#endregion

//#region 端口注册表

function registryDir() {
    return path.join(os.homedir(), '.CocosCreator', PKG_NAME, 'ports');
}

function registryFile() {
    var root = projectRoot();
    if (!root) return null;
    var name = path.basename(root).replace(/[^\w\-.]/g, '_');
    return path.join(registryDir(), name + '.json');
}

function writeRegistry(port) {
    var file = registryFile();
    if (!file) return null;
    // 跑测试时不写注册表：测试进程和真编辑器同项目名会互相覆盖
    if (process.env.COCOS_MCP_NO_REGISTRY === '1') return null;
    try {
        fs.mkdirSync(registryDir(), { recursive: true });
        fs.writeFileSync(file, JSON.stringify({
            name: path.basename(projectRoot()),
            project: projectRoot(),
            port: port,
            pid: process.pid,
            startedAt: new Date().toISOString()
        }, null, 2), 'utf8');
        return file;
    } catch (e) {
        if (typeof Editor !== 'undefined' && Editor.warn) {
            Editor.warn(LOG, '端口注册表写入失败：' + e.message);
        }
        return null;
    }
}

function clearRegistry() {
    if (process.env.COCOS_MCP_NO_REGISTRY === '1') return;
    var file = registryFile();
    if (!file) return;
    try {
        fs.unlinkSync(file);
    } catch (e) { /* 本来就没有 */ }
}

//#endregion

//#region 工具声明

var TOOLS = [
    {
        name: 'get_project_info',
        description: '获取当前 Cocos Creator 2.x 项目的基本信息：项目路径、引擎版本、场景文件列表、当前 MCP 端口。任何操作前先调这个确认上下文。',
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
        name: 'search_files',
        description: '在项目内做全文搜索，返回 文件:行号:内容。读代码前先用它定位，不要靠猜路径逐个 read_file。默认按字面量匹配（不解析正则），支持 glob 过滤文件类型。',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: '要搜的内容，如 "MiniGame.init"' },
                path: { type: 'string', description: '搜索范围，相对项目根，默认 "assets"' },
                glob: { type: 'string', description: '文件名过滤，如 "*.ts" 或 "*.ts,*.js"。含 / 时按相对路径匹配' },
                context: { type: 'number', description: '每条命中前后各带几行上下文，0-5，默认 0' },
                maxResults: { type: 'number', description: '最多返回多少条，默认 80，上限 300' },
                useRegex: { type: 'boolean', description: '把 pattern 当正则用，默认 false' },
                ignoreCase: { type: 'boolean', description: '忽略大小写，默认 true' },
                includeMeta: { type: 'boolean', description: '是否也搜 .meta 文件，默认 false' }
            },
            required: ['pattern']
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
        description: '解析 .fire 场景文件或 .prefab 预制体，返回节点树：名称、层级、位置、尺寸、挂载的组件。脚本组件会自动反解出 script 路径和 className，不用再猜压缩 uuid 是谁。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的 .fire 或 .prefab 路径' },
                maxDepth: { type: 'number', description: '最大展开层级，默认 20' },
                node: { type: 'string', description: '只看某个节点的子树，路径如 "Canvas/bottomUI"，或节点 id' }
            },
            required: ['path']
        }
    },
    {
        name: 'read_scene_node',
        description: '读取单个节点的完整序列化内容：位置、缩放、尺寸、锚点、颜色，以及每个组件的 @property 真实值（引用的节点和资源会翻译成名字/路径）。改场景前先用它看现状。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '相对项目根的 .fire 或 .prefab 路径' },
                node: { type: 'string', description: '节点路径 "Canvas/bottomUI"、节点 id、或全树唯一的名字' },
                depth: { type: 'number', description: '属性展开深度，默认 3，最大 6' }
            },
            required: ['path', 'node']
        }
    },
    {
        name: 'resolve_uuid',
        description: 'uuid 与资源路径双向解析。传完整 uuid / 压缩 uuid（23 字符）/ 相对路径任意一种，返回另一个。场景里看到可疑的 __uuid__ 时用它查是哪个资源。',
        inputSchema: {
            type: 'object',
            properties: {
                uuid: { type: 'string', description: '完整 uuid、压缩 uuid，或相对项目根的资源路径' }
            },
            required: ['uuid']
        }
    },
    {
        name: 'get_editor_log',
        description: '读取编辑器最新的日志文件末尾若干行。AI 改完代码后用它确认有没有编译错误、资源报错。可按关键字和级别过滤。',
        inputSchema: {
            type: 'object',
            properties: {
                lines: { type: 'number', description: '读取末尾多少行，默认 80，最大 500' },
                keyword: { type: 'string', description: '只保留包含该关键字的行（不区分大小写）' },
                level: { type: 'string', description: 'all / error / warn，默认 all' }
            },
            required: []
        }
    },
    {
        name: 'execute_script',
        description: '在扩展主进程里执行一段 JavaScript，可以访问全局 Editor 和 require。万能兜底工具：当成普通函数体写，要返回结果就写 return。支持 async / Promise，会等结果。',
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: '要执行的代码，可含 return，可 await' }
            },
            required: ['code']
        }
    },
    {
        name: 'refresh_assets',
        description: '让编辑器重新导入资源。改完 .fire / .prefab / 图片或新增文件后必须调用，否则编辑器看不到变化。会等导入真正完成再返回。',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'db:// 开头的资源路径，默认 db://assets/' }
            },
            required: []
        }
    },
    {
        name: 'list_open_projects',
        description: '列出本机所有打开着的 Cocos 2.x 项目及其 MCP 端口。同时开多个项目时端口会递增，用这个查清楚谁在哪个端口，再决定 mcp.json 指向哪里。',
        inputSchema: { type: 'object', properties: {}, required: [] }
    }
];

//#endregion

//#region 工具实现

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
        walkFiles(sceneDir, { maxDepth: 6, skip: SKIP_DIRS }, function (full, name) {
            if (name.slice(-5) === '.fire') info.scenes.push(relPath(full));
        });
        info.scenes.sort();
    }

    // uuid 索引规模，顺手确认 assets 扫得到
    try {
        var idx = buildUuidIndex(false);
        info.assetCount = idx.count;
    } catch (e) {
        info.assetCount = null;
    }

    info.mcpPort = listeningPort;
    info.mcpUrl = 'http://127.0.0.1:' + listeningPort + '/mcp';
    return info;
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

function toolSearchFiles(args) {
    var t0 = Date.now();
    if (!args.pattern) throw new Error('缺少 pattern');

    var base = safePath(args.path || 'assets');
    var st = statSafe(base);
    if (!st) throw new Error('路径不存在：' + (args.path || 'assets'));

    var flags = args.ignoreCase === false ? '' : 'i';
    var src = args.useRegex ? args.pattern : escapeRegExp(args.pattern);
    var re;
    try {
        re = new RegExp(src, flags);
    } catch (e) {
        throw new Error('正则无效：' + e.message);
    }

    var maxResults = typeof args.maxResults === 'number' ? args.maxResults : 80;
    if (maxResults < 1) maxResults = 80;
    if (maxResults > 300) maxResults = 300;

    var ctx = typeof args.context === 'number' ? args.context : 0;
    if (ctx < 0) ctx = 0;
    if (ctx > 5) ctx = 5;

    var globRaw = args.glob ? String(args.glob) : null;
    var globRe = globRaw ? globToRegExp(globRaw) : null;
    var globByPath = globRaw ? globRaw.indexOf('/') >= 0 : false;
    var includeMeta = args.includeMeta === true;

    var candidates = [];
    function pushCandidate(full, name) {
        if (!includeMeta && name.slice(-5) === '.meta') return;
        if (globRe) {
            var target = globByPath ? relPath(full) : name;
            if (!globRe.test(target)) return;
        }
        candidates.push({ full: full, name: name });
    }

    if (st.isDirectory()) {
        walkFiles(base, { maxDepth: 30, skip: SKIP_DIRS }, function (full, name, s) {
            if (s.size > MAX_SEARCH_BYTES) return;
            pushCandidate(full, name);
        });
    } else {
        pushCandidate(base, path.basename(base));
    }

    candidates.sort(function (a, b) { return a.full < b.full ? -1 : (a.full > b.full ? 1 : 0); });

    var matches = [];
    var scanned = 0;
    var matchedFiles = 0;
    var total = 0;

    for (var i = 0; i < candidates.length; i++) {
        var f = candidates[i];
        var buf;
        try {
            buf = fs.readFileSync(f.full);
        } catch (e) {
            continue;
        }
        // 二进制文件里出现 \0 就当它不是文本
        if (buf.slice(0, 4096).toString('binary').indexOf('\u0000') >= 0) continue;
        scanned++;

        var text = buf.toString('utf8');
        if (text.indexOf('\ufeff') === 0) text = text.slice(1);
        var lines = text.split(/\r?\n/);
        var fileHit = 0;

        for (var L = 0; L < lines.length; L++) {
            if (!re.test(lines[L])) continue;
            total++;
            fileHit++;
            // 统计照做，只限制返回条数，这样 truncated 不会在"刚好装满"时误报
            if (matches.length >= maxResults) continue;
            var item = {
                file: relPath(f.full),
                line: L + 1,
                text: lines[L].length > MAX_LINE_CHARS
                    ? lines[L].slice(0, MAX_LINE_CHARS) + ' …'
                    : lines[L]
            };
            if (ctx > 0) {
                item.before = lines.slice(Math.max(0, L - ctx), L);
                item.after = lines.slice(L + 1, Math.min(lines.length, L + 1 + ctx));
            }
            matches.push(item);
        }
        if (fileHit > 0) matchedFiles++;
    }

    return {
        pattern: args.pattern,
        root: relPath(base),
        scannedFiles: scanned,
        matchedFiles: matchedFiles,
        totalMatches: total,
        returned: matches.length,
        truncated: total > matches.length,
        tookMs: Date.now() - t0,
        matches: matches
    };
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
    var idx = buildUuidIndex(false);

    var startId = rootId;
    if (args.node) {
        var found = findNode(arr, rootId, args.node);
        if (found === null) {
            var byName = findNodeByName(arr, rootId, String(args.node));
            if (byName >= 0) found = byName;
        }
        if (found === null || found === undefined || found < 0) {
            throw new Error('找不到节点：' + args.node);
        }
        startId = found;
    }

    var tree = expandNode(arr, startId, 0, maxDepth, idx);

    return {
        path: relPath(abs),
        totalObjects: arr.length,
        nodeCount: tree ? countNodes(tree) : 0,
        rootId: startId,
        tree: tree
    };
}

function toolReadSceneNode(args) {
    if (!args.path) throw new Error('缺少 path');
    if (!args.node) throw new Error('缺少 node');

    var abs = safePath(args.path);
    if (!statSafe(abs)) throw new Error('文件不存在：' + args.path);

    var arr = loadSerialized(abs);
    var rootId = findRootIndex(arr);
    var idx = buildUuidIndex(false);

    var id = findNode(arr, rootId, args.node);
    if (id === null) {
        var byName = findNodeByName(arr, rootId, String(args.node));
        if (byName >= 0) id = byName;
    }
    if (id === null || id === undefined || id < 0) throw new Error('找不到节点：' + args.node);

    var depth = typeof args.depth === 'number' ? args.depth : 3;
    if (depth < 0) depth = 0;
    if (depth > 6) depth = 6;

    var obj = arr[id];
    var out = {
        path: relPath(abs),
        id: id,
        type: obj.__type__,
        name: obj._name || (obj.__type__ === 'cc.Scene' ? 'Scene' : ''),
        active: obj._active,
        position: readTRS(obj),
        scale: readScaleTRS(obj),
        rotationZ: readRotationTRS(obj),
        size: obj._contentSize || null,
        anchor: obj._anchorPoint || null,
        color: obj._color || null,
        opacity: obj._opacity,
        layer: obj._layer,
        children: [],
        components: []
    };

    var kids = obj._children || [];
    for (var i = 0; i < kids.length; i++) {
        var kid = arr[kids[i] && kids[i].__id__];
        if (kid) out.children.push({ id: kids[i].__id__, name: kid._name || '', active: kid._active });
    }

    var comps = obj._components || [];
    for (var c = 0; c < comps.length; c++) {
        var cid = comps[c] && comps[c].__id__;
        var comp = arr[cid];
        if (!comp) continue;
        var desc = describeComponentType(comp.__type__, idx);
        var entry = {
            id: cid,
            type: comp.__type__,
            enabled: comp._enabled !== false
        };
        if (desc.isScript) {
            entry.script = desc.script || null;
            entry.className = desc.className || null;
        }
        entry.props = dumpProps(arr, comp, depth, idx);
        out.components.push(entry);
    }

    return out;
}

function toolResolveUuid(args) {
    var q = args.uuid;
    if (!q) throw new Error('缺少 uuid');
    q = String(q).trim();
    var idx = buildUuidIndex(false);

    // 情况一：完整 uuid
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(q)) {
        var rel = idx.byFull[q] || null;
        return {
            input: q,
            uuid: q,
            compressed: compressUuid(q),
            path: rel,
            exists: !!rel,
            kind: rel ? guessKind(rel) : null,
            script: rel && /\.(ts|js)$/i.test(rel) ? readScriptInfo(rel) : null
        };
    }

    // 情况二：压缩 uuid（23 字符）
    if (q.length === 23 && idx.byShort[q]) {
        var full = idx.byShort[q];
        var p2 = idx.byFull[full] || null;
        return {
            input: q,
            uuid: full,
            compressed: q,
            path: p2,
            exists: !!p2,
            kind: p2 ? guessKind(p2) : null,
            script: p2 && /\.(ts|js)$/i.test(p2) ? readScriptInfo(p2) : null
        };
    }

    // 情况三：当成路径
    var abs = safePath(q);
    if (!statSafe(abs)) throw new Error('既不是已知 uuid，也找不到这个文件：' + q);
    var u = pathToUuid(q);
    return {
        input: q,
        uuid: u,
        compressed: u ? compressUuid(u) : null,
        path: q,
        exists: true,
        kind: guessKind(q),
        script: /\.(ts|js)$/i.test(q) ? readScriptInfo(q) : null
    };
}

function guessKind(rel) {
    var lower = String(rel).toLowerCase();
    if (lower.slice(-5) === '.fire') return 'scene';
    if (lower.slice(-7) === '.prefab') return 'prefab';
    if (lower.slice(-3) === '.ts' || lower.slice(-3) === '.js') return 'script';
    if (lower.slice(-4) === '.png' || lower.slice(-4) === '.jpg') return 'image';
    if (lower.slice(-5) === '.json') return 'json';
    return 'asset';
}

function toolGetEditorLog(args) {
    var n = typeof args.lines === 'number' ? args.lines : 80;
    if (n < 1) n = 80;
    if (n > 500) n = 500;

    var abs = latestEditorLog();
    if (!abs) return '（找不到编辑器日志文件）';

    // 只读末尾 2MB，日志动辄几百 MB，整读会卡死扩展主进程
    var text = readTail(abs, 2 * 1024 * 1024);
    var all = text.split(/\r?\n/);

    var level = args.level ? String(args.level).toLowerCase() : 'all';
    var kw = args.keyword ? String(args.keyword).toLowerCase() : null;

    var filtered = [];
    for (var i = 0; i < all.length; i++) {
        var line = all[i];
        if (kw && line.toLowerCase().indexOf(kw) < 0) continue;
        if (level === 'error' && !/error|exception|失败|异常/i.test(line)) continue;
        if (level === 'warn' && !/warn|警告/i.test(line)) continue;
        filtered.push(line);
    }

    var tail = filtered.slice(Math.max(0, filtered.length - n));

    return '文件：' + abs +
        '\n总行数：' + all.length +
        (filtered.length !== all.length ? '（过滤后 ' + filtered.length + ' 行）' : '') +
        '\n--- 末尾 ' + tail.length + ' 行 ---\n' + tail.join('\n');
}

function toolExecuteScript(args) {
    if (!args.code) throw new Error('缺少 code');
    var fn;
    try {
        // AsyncFunction：让 code 里可以直接写 await
        fn = new Function('Editor', 'require', 'return (async function () {\n' + args.code + '\n})();');
    } catch (e) {
        throw new Error('语法错误：' + e.message);
    }

    return fn(typeof Editor !== 'undefined' ? Editor : null, require).then(function (result) {
        var out = { result: typeof result === 'undefined' ? null : result, type: typeof result };
        return out;
    });
}

function toolRefreshAssets(args) {
    var dbPath = args.path || 'db://assets/';
    if (typeof Editor === 'undefined' || !Editor.assetdb) {
        throw new Error('Editor.assetdb 不可用');
    }

    // 索引失效，下次查询重新扫
    uuidCache.time = 0;

    var done = new Promise(function (resolve) {
        var called = false;
        function finish(err) {
            if (called) return;
            called = true;
            resolve({ refreshed: dbPath, done: true, error: err ? String(err.message || err) : null });
        }
        try {
            if (Editor.assetdb.refresh.length >= 2) {
                Editor.assetdb.refresh(dbPath, finish);
                // 回调不来也不能把整个请求挂住
                setTimeout(function () { finish(null); }, 3000);
            } else {
                // 老版本 / mock 里只有一个参数，只能尽力而为
                Editor.assetdb.refresh(dbPath);
                finish(null);
            }
        } catch (e) {
            finish(e);
        }
    });
    return done;
}

function toolListOpenProjects() {
    var dir = registryDir();
    var out = [];
    var files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return { dir: dir, count: 0, projects: [], note: '注册表目录还不存在，说明没有项目启动过 v0.2 的服务' };
    }

    var cur = projectRoot();
    for (var i = 0; i < files.length; i++) {
        if (files[i].slice(-5) !== '.json') continue;
        var full = path.join(dir, files[i]);
        try {
            var o = JSON.parse(fs.readFileSync(full, 'utf8'));
            var st = statSafe(full);
            o.url = 'http://127.0.0.1:' + o.port + '/mcp';
            o.isCurrent = cur === o.project;
            o.updatedAt = st ? new Date(st.mtimeMs).toISOString() : null;
            out.push(o);
        } catch (e) { /* 坏文件跳过 */ }
    }
    out.sort(function (a, b) { return a.port - b.port; });
    return {
        dir: dir,
        count: out.length,
        current: cur,
        projects: out,
        hint: out.length > 1
            ? '多个项目同时开着，mcp.json 的 url 要指向你想操作的那个项目的端口'
            : '只有一个项目注册过'
    };
}

function callTool(name, args) {
    args = args || {};
    switch (name) {
        case 'get_project_info': return toolGetProjectInfo();
        case 'list_dir': return toolListDir(args);
        case 'search_files': return toolSearchFiles(args);
        case 'read_file': return toolReadFile(args);
        case 'write_file': return toolWriteFile(args);
        case 'query_scene_tree': return toolQuerySceneTree(args);
        case 'read_scene_node': return toolReadSceneNode(args);
        case 'resolve_uuid': return toolResolveUuid(args);
        case 'get_editor_log': return toolGetEditorLog(args);
        case 'execute_script': return toolExecuteScript(args);
        case 'refresh_assets': return toolRefreshAssets(args);
        case 'list_open_projects': return toolListOpenProjects();
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

/**
 * 返回值可能是对象，也可能是 Promise（execute_script / refresh_assets）。
 * 调用方统一 Promise.resolve 包一层。
 */
function handleRpc(msg) {
    var id = msg.id;
    var method = msg.method;

    // 通知类消息没有 id，不需要回复
    if (id === undefined || id === null) return null;

    if (method === 'initialize') {
        return rpcResult(id, {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: PKG_NAME, version: VERSION, instanceId: INSTANCE_ID },
            instructions: 'Cocos Creator 2.x 项目操作入口。文件读写限制在项目目录内。读代码先 search_files，看场景先 query_scene_tree，改完 .fire/.prefab 记得 refresh_assets。'
        });
    }

    if (method === 'tools/list') {
        return rpcResult(id, { tools: TOOLS });
    }

    if (method === 'tools/call') {
        var params = msg.params || {};
        var name = params.name;
        var args = params.arguments || {};
        return Promise.resolve()
            .then(function () { return callTool(name, args); })
            .then(function (out) {
                var text = typeof out === 'string' ? out : JSON.stringify(out, null, 2);
                return rpcResult(id, { content: [{ type: 'text', text: text }] });
            })
            .catch(function (e) {
                return rpcResult(id, {
                    content: [{ type: 'text', text: '错误：' + (e && e.message ? e.message : String(e)) }],
                    isError: true
                });
            });
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

            Promise.resolve()
                .then(function () { return handleRpc(msg); })
                .then(function (reply) {
                    // 通知类消息返回 202 空体
                    if (reply === null) {
                        res.writeHead(202);
                        res.end();
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(reply));
                })
                .catch(function (e) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(rpcError(msg && msg.id, -32603, e && e.message ? e.message : String(e))));
                });
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
        var regFile = writeRegistry(port);

        Editor.success(LOG, 'MCP 已启动 → http://127.0.0.1:' + port + '/mcp');
        Editor.log(LOG, '项目：' + projectRoot());
        if (regFile) Editor.log(LOG, '端口已登记：' + regFile);
        Editor.log(LOG, '把这行加进 ~/.workbuddy/mcp.json：');
        Editor.log(LOG, '  "cocos-mcp-2x": { "type": "http", "url": "http://127.0.0.1:' + port + '/mcp" }');
    });
}

function stopServer() {
    clearRegistry();
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
        Editor.log(LOG, 'v' + VERSION + ' 扩展加载中，项目路径 = ' + projectRoot());
        startServer(BASE_PORT);
    },

    unload: function () {
        stopServer();
        Editor.log(LOG, '扩展已卸载，服务已停止');
    },

    messages: {

        'status': function () {
            if (server && listeningPort) {
                Editor.log(LOG, '运行中 v' + VERSION + ' → http://127.0.0.1:' + listeningPort + '/mcp');
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
        },

        'projects': function () {
            var r = toolListOpenProjects();
            Editor.log(LOG, '注册表：' + r.dir);
            if (!r.count) {
                Editor.log(LOG, '（没有其他项目登记过）');
                return;
            }
            for (var i = 0; i < r.projects.length; i++) {
                var p = r.projects[i];
                Editor.log(LOG, '  ' + p.port + '  ' + p.name + (p.isCurrent ? '  ← 当前项目' : ''));
                Editor.log(LOG, '      ' + p.project);
            }
        }
    }
};
