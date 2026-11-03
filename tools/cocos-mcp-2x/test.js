'use strict';

/**
 * 在 Node 里把 Editor 全局 mock 掉，然后真发 HTTP 请求测这个扩展。
 *
 * 为什么要这么测：
 *   扩展的代码 99% 是"拿到 Editor.Project.path → 操作文件 → 返回"，
 *   这些逻辑跟 Cocos 编辑器本身没关系。只要 Editor 这个壳能 mock，
 *   就能在装进编辑器之前把工具全部跑一遍，不用反复重启编辑器试错。
 *
 * 用法：node test.js [项目路径]
 *   默认用 D:/CocosProject/PinGame
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const PROJECT = process.argv[2] || 'D:/CocosProject/PinGame';

if (!fs.existsSync(PROJECT)) {
    console.error('项目不存在：' + PROJECT);
    process.exit(1);
}

// 别让测试进程往端口注册表里写东西，会和真编辑器抢同一个项目名
process.env.COCOS_MCP_NO_REGISTRY = '1';

let port = 0;
const logs = [];

global.Editor = {
    Project: { path: PROJECT },
    log: function () {
        const s = Array.prototype.join.call(arguments, ' ');
        logs.push(s);
        console.log('  [log] ' + s);
    },
    success: function () {
        const s = Array.prototype.join.call(arguments, ' ');
        logs.push(s);
        console.log('  [ok]  ' + s);
        // 从启动日志里抓端口，因为端口可能因占用而递增
        const m = s.match(/127\.0\.0\.1:(\d+)/);
        if (m) port = parseInt(m[1], 10);
    },
    warn: function () {
        const s = Array.prototype.join.call(arguments, ' ');
        logs.push('[warn] ' + s);
        console.log('  [warn] ' + s);
    },
    error: function () {
        const s = Array.prototype.join.call(arguments, ' ');
        logs.push('[error] ' + s);
        console.log('  [err] ' + s);
    },
    assetdb: {
        // 故意只声明一个形参：验证扩展对"老版本 / mock 只有一个参数"的降级分支
        refresh: function (p) { console.log('  [assetdb.refresh] ' + p); }
    }
};

console.log('=== 加载扩展 ===');
const ext = require('./main.js');
ext.load();

function rpc(method, params) {
    return new Promise(function (resolve, reject) {
        const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params });
        const req = http.request({
            host: '127.0.0.1',
            port: port,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, function (res) {
            let data = '';
            res.on('data', function (c) { data += c; });
            res.on('end', function () {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('返回不是 JSON：' + data.slice(0, 200)));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function callTool(name, args) {
    const r = await rpc('tools/call', { name: name, arguments: args || {} });
    if (!r.result) throw new Error('无 result：' + JSON.stringify(r));
    const text = r.result.content[0].text;
    if (r.result.isError) return { error: text };
    try { return JSON.parse(text); } catch (e) { return text; }
}

let passed = 0;
let failed = 0;
// 真实场景路径不硬编码：不同项目叫 Game.fire / MainScene.fire / landscape.fire...
let scenePath = null;

function check(name, fn) {
    return Promise.resolve()
        .then(fn)
        .then(function () {
            passed++;
            console.log('  PASS  ' + name);
        })
        .catch(function (e) {
            failed++;
            console.log('  FAIL  ' + name);
            console.log('        ' + e.message);
        });
}

/** 把节点树压平成 [{node, path}]，方便按路径断言 */
function flatten(tree) {
    const out = [];
    (function walk(n, prefix) {
        const cur = prefix ? prefix + '/' + n.name : n.name;
        out.push({ node: n, path: cur });
        (n.children || []).forEach(function (c) { walk(c, cur); });
    })(tree, '');
    return out;
}

async function main() {
    // 等服务器起来
    for (let i = 0; i < 50 && !port; i++) {
        await new Promise(function (r) { setTimeout(r, 60); });
    }
    if (!port) throw new Error('服务没起来（拿不到端口）');
    console.log('端口 = ' + port + '\n');

    console.log('=== 协议层 ===');

    await check('initialize 返回 serverInfo', async function () {
        const r = await rpc('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test', version: '1' }
        });
        assert.strictEqual(r.result.serverInfo.name, 'cocos-mcp-2x');
        assert.strictEqual(r.result.protocolVersion, '2024-11-05');
        assert.ok(r.result.serverInfo.version, '缺少 version');
        assert.ok(r.result.serverInfo.instanceId, '缺少 instanceId（热重载脚本靠它判断换没换实例）');
        console.log('        版本 = ' + r.result.serverInfo.version +
            '，实例 = ' + r.result.serverInfo.instanceId);
    });

    await check('tools/list 返回 12 个工具', async function () {
        const r = await rpc('tools/list', {});
        assert.strictEqual(r.result.tools.length, 12);
        const names = r.result.tools.map(function (t) { return t.name; });
        ['search_files', 'resolve_uuid', 'read_scene_node', 'list_open_projects'].forEach(function (n) {
            assert.ok(names.indexOf(n) >= 0, '缺工具 ' + n);
        });
        // 每个工具都得有合法 schema，否则客户端会直接拒收
        r.result.tools.forEach(function (t) {
            assert.strictEqual(t.inputSchema.type, 'object', t.name + ' 的 schema 不对');
        });
    });

    await check('未知方法返回 -32601', async function () {
        const r = await rpc('nonexistent/method', {});
        assert.strictEqual(r.error.code, -32601);
    });

    console.log('\n=== 项目信息 ===');

    await check('get_project_info 读到路径和版本', async function () {
        const info = await callTool('get_project_info');
        assert.strictEqual(path.resolve(info.path), path.resolve(PROJECT), '路径不对：' + info.path);
        assert.ok(info.version, '没读到 version');
        assert.ok(Array.isArray(info.scenes) && info.scenes.length > 0, '没找到 .fire');
        scenePath = info.scenes[0];
        console.log('        版本 = ' + info.version + '，资源数 = ' + info.assetCount);
        console.log('        场景：' + info.scenes.join(', '));
    });

    console.log('\n=== 文件操作 ===');

    await check('list_dir 列出 assets', async function () {
        const r = await callTool('list_dir', { path: 'assets' });
        assert.ok(r.count > 0);
        assert.ok(r.items.some(function (i) { return i.dir; }), '一个目录都没有，可疑');
    });

    await check('read_file 读 project.json', async function () {
        const text = await callTool('read_file', { path: 'project.json' });
        // project.json 本身是合法 JSON，会被 callTool 一并解析成对象
        const asText = typeof text === 'string' ? text : JSON.stringify(text);
        assert.ok(asText.indexOf('version') >= 0, '内容里没有 version');
    });

    await check('write_file 写入后能读回', async function () {
        const p = 'temp/mcp-test-probe.txt';
        const content = 'probe-' + Date.now();
        await callTool('write_file', { path: p, content: content });
        const back = await callTool('read_file', { path: p });
        assert.strictEqual(back, content);
    });

    await check('路径越界被拦截', async function () {
        const r = await callTool('read_file', { path: '../../../Windows/win.ini' });
        assert.ok(r.error, '应该报错但没报');
        assert.ok(r.error.indexOf('越界') >= 0, '错误信息不对：' + r.error);
    });

    console.log('\n=== 全文搜索 ===');

    await check('search_files 字面量搜索', async function () {
        // 先用 bottle_new 项目里的特征词；换别的项目搜不到就退回通用词，
        // 免得测试绑死在某个项目的代码上
        let r = await callTool('search_files', { pattern: 'MiniGame', glob: '*.ts' });
        if (!r.totalMatches) {
            r = await callTool('search_files', { pattern: 'import', glob: '*.ts' });
        }
        if (!r.totalMatches) {
            r = await callTool('search_files', { pattern: 'cc', path: 'assets' });
        }
        assert.ok(r.totalMatches > 0, '一条都没搜到');
        if (r.pattern !== 'cc') {
            assert.ok(r.matches.every(function (m) { return /\.ts$/.test(m.file); }), 'glob 过滤没生效');
        }
        console.log('        扫描 ' + r.scannedFiles + ' 个文件，命中 ' + r.totalMatches +
            ' 条 / ' + r.matchedFiles + ' 个文件，耗时 ' + r.tookMs + 'ms');
        console.log('        首条：' + r.matches[0].file + ':' + r.matches[0].line);
    });

    await check('search_files 正则模式 + 上下文', async function () {
        const r = await callTool('search_files', {
            pattern: 'import\\s+.*from',
            glob: '*.ts',
            useRegex: true,
            context: 1,
            maxResults: 3
        });
        assert.ok(r.totalMatches > 0, '正则一条都没搜到');
        assert.ok(r.matches[0].before !== undefined, '没带上下文');
        assert.ok(r.matches.length <= 3, 'maxResults 没生效');
    });

    await check('search_files 默认跳过 .meta', async function () {
        const withMeta = await callTool('search_files', { pattern: 'uuid', includeMeta: true, maxResults: 300 });
        const withoutMeta = await callTool('search_files', { pattern: 'uuid', maxResults: 300 });
        assert.ok(withoutMeta.matches.every(function (m) { return !/\.meta$/.test(m.file); }), '还搜到了 .meta');
        console.log('        含 .meta：' + withMeta.totalMatches + ' 条；不含：' + withoutMeta.totalMatches + ' 条');
    });

    await check('search_files truncated 只在真超出上限时为 true', async function () {
        const narrow = await callTool('search_files', { pattern: 'BottleData.init', maxResults: 50 });
        assert.strictEqual(narrow.truncated, false, '没超上限却标了 truncated');
        const capped = await callTool('search_files', { pattern: 'import', glob: '*.ts', maxResults: 2 });
        if (capped.totalMatches > 2) {
            assert.strictEqual(capped.truncated, true, '超了上限却没标 truncated');
            assert.strictEqual(capped.returned, 2, 'returned 不等于 maxResults');
            assert.ok(capped.totalMatches > capped.returned);
            console.log('        上限 2 → 返回 ' + capped.returned + '，实际共 ' + capped.totalMatches + ' 条');
        }
    });

    console.log('\n=== uuid 解析 ===');

    let scriptComp = null;
    let scriptNodePath = null;

    await check('query_scene_tree 把脚本组件反解成路径和类名', async function () {
        assert.ok(scenePath, '前置失败：没拿到场景路径');
        const r = await callTool('query_scene_tree', { path: scenePath });
        const all = flatten(r.tree);
        for (const it of all) {
            const c = (it.node.components || []).find(function (x) { return x.isScript; });
            if (c) { scriptComp = c; scriptNodePath = it.path; break; }
        }
        assert.ok(scriptComp, '场景里没有任何脚本组件');
        assert.ok(scriptComp.script, '脚本组件没反解出路径，仍然只有 uuid：' + scriptComp.type);
        console.log('        节点 "' + scriptNodePath + '" → ' + scriptComp.script +
            ' (' + scriptComp.className + ')');
    });

    await check('compressUuid 与场景里的 __type__ 完全一致', async function () {
        assert.ok(scriptComp && scriptComp.script, '前置失败：没找到可用的脚本组件');
        const r = await callTool('resolve_uuid', { uuid: scriptComp.script });
        assert.strictEqual(r.compressed, scriptComp.type,
            '压缩结果 ' + r.compressed + ' ≠ 场景里的 ' + scriptComp.type);
        assert.ok(r.uuid && r.uuid.length === 36, '没解析出完整 uuid');
    });

    await check('resolve_uuid 压缩 uuid 能还原成路径', async function () {
        assert.ok(scriptComp, '前置失败');
        const r = await callTool('resolve_uuid', { uuid: scriptComp.type });
        assert.strictEqual(r.path, scriptComp.script, '还原路径不对：' + r.path);
    });

    await check('resolve_uuid 不认识的输入报错', async function () {
        const r = await callTool('resolve_uuid', { uuid: 'assets/不存在的路径.ts' });
        assert.ok(r.error, '应该报错');
    });

    console.log('\n=== 场景解析 ===');

    await check('query_scene_tree 解析真实场景', async function () {
        assert.ok(scenePath, '前置失败：没拿到场景路径');
        const r = await callTool('query_scene_tree', { path: scenePath });
        assert.ok(r.tree, '没有 tree');
        assert.ok(r.nodeCount > 0, '节点数为 0');
        assert.ok(r.totalObjects > 0);
        console.log('        文件 = ' + scenePath);
        console.log('        对象数 = ' + r.totalObjects + '，节点数 = ' + r.nodeCount);
        console.log('        根节点 = ' + r.tree.name + '（' + r.tree.type + '）');
        console.log('        一级子节点：' + r.tree.children.map(function (c) {
            return c.name + '[' + (c.components || []).length + '组件]';
        }).join(', '));
    });

    await check('maxDepth 生效（不展开到底）', async function () {
        const deep = await callTool('query_scene_tree', { path: scenePath, maxDepth: 100 });
        const shallow = await callTool('query_scene_tree', { path: scenePath, maxDepth: 1 });
        assert.ok(shallow.nodeCount <= deep.nodeCount, '浅层反而节点更多，maxDepth 没生效');
        console.log('        depth=1 → ' + shallow.nodeCount + ' 节点；depth=100 → ' + deep.nodeCount + ' 节点');
    });

    await check('query_scene_tree 支持按节点路径取子树', async function () {
        const r = await callTool('query_scene_tree', { path: scenePath, node: scriptNodePath });
        assert.ok(r.tree, '没有 subtree');
        assert.strictEqual(r.tree.name, scriptNodePath.split('/').pop());
        assert.ok(r.nodeCount < 999, '子树节点数异常');
        console.log('        子树 "' + r.tree.name + '" 共 ' + r.nodeCount + ' 个节点');
    });

    await check('read_scene_node 读出组件真实属性', async function () {
        assert.ok(scriptNodePath, '前置失败：没拿到节点路径');
        const r = await callTool('read_scene_node', { path: scenePath, node: scriptNodePath });
        assert.strictEqual(r.name, scriptNodePath.split('/').pop());
        assert.ok(r.components.length > 0, '没有组件');
        assert.ok(r.position && typeof r.position.x === 'number', '位置没读出来');
        const script = r.components.find(function (c) { return c.script; });
        assert.ok(script, '组件里没有脚本');
        assert.ok(script.props && typeof script.props === 'object', '没有 props');
        // @property 引用的节点应该被翻译成名字
        const propsText = JSON.stringify(script.props);
        console.log('        组件：' + r.components.map(function (c) {
            return c.className || c.type;
        }).join(', '));
        console.log('        props 字节数 = ' + propsText.length);
    });

    await check('read_scene_node 找不到节点时报错', async function () {
        const r = await callTool('read_scene_node', { path: scenePath, node: '不存在的节点xyz' });
        assert.ok(r.error, '应该报错');
        assert.ok(r.error.indexOf('找不到节点') >= 0, '错误信息不对：' + r.error);
    });

    console.log('\n=== 其它工具 ===');

    await check('get_editor_log 能读到日志', async function () {
        const text = await callTool('get_editor_log', { lines: 5 });
        assert.ok(typeof text === 'string');
        assert.ok(text.length > 0);
        // 必须指到真正在写的那个日志：2.4 有 log/ 和 logs/ 两个目录，
        // 只扫 log/ 会读到几个月前的旧文件
        const m = text.match(/^文件：(.+)$/m);
        assert.ok(m, '返回里没有文件路径');
        const logFile = m[1].trim();
        const st = fs.statSync(logFile);
        const ageHours = (Date.now() - st.mtimeMs) / 3600000;
        console.log('        日志 = ' + logFile + '（' + ageHours.toFixed(1) + ' 小时前更新）');
        assert.ok(ageHours < 24, '日志是 ' + ageHours.toFixed(0) + ' 小时前的，指错文件了：' + logFile);
    });

    await check('execute_script 能访问 Editor', async function () {
        const r = await callTool('execute_script', {
            code: 'return { project: Editor.Project.path, hasAssetdb: !!Editor.assetdb };'
        });
        assert.strictEqual(path.resolve(r.result.project), path.resolve(PROJECT));
        assert.strictEqual(r.result.hasAssetdb, true);
    });

    await check('execute_script 支持 await（v0.2 新增）', async function () {
        const r = await callTool('execute_script', {
            code: 'var v = await Promise.resolve(21); return v * 2;'
        });
        assert.strictEqual(r.result, 42, 'async 没生效，拿到：' + JSON.stringify(r));
    });

    await check('execute_script 报错被捕获成 isError', async function () {
        const r = await callTool('execute_script', { code: 'throw new Error("故意抛错");' });
        assert.ok(r.error, '应该返回错误');
        assert.ok(r.error.indexOf('故意抛错') >= 0);
    });

    await check('refresh_assets 调到 assetdb', async function () {
        const r = await callTool('refresh_assets', {});
        assert.strictEqual(r.refreshed, 'db://assets/');
    });

    await check('list_open_projects 能返回结构（测试模式不写注册表）', async function () {
        const r = await callTool('list_open_projects', {});
        assert.ok(Array.isArray(r.projects), 'projects 不是数组');
        assert.ok(typeof r.dir === 'string');
        console.log('        注册表目录 = ' + r.dir + '，登记项目 ' + r.count + ' 个');
    });

    console.log('\n============================');
    console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
    console.log('============================');

    // 清掉探测文件，不在别人的项目里留垃圾
    try {
        fs.unlinkSync(path.join(PROJECT, 'temp', 'mcp-test-probe.txt'));
    } catch (e) { /* 本来就没有 */ }

    ext.unload();
    process.exit(failed === 0 ? 0 : 1);
}

main().catch(function (e) {
    console.error('测试异常：', e);
    process.exit(1);
});
