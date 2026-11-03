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
    });

    await check('tools/list 返回 8 个工具', async function () {
        const r = await rpc('tools/list', {});
        assert.strictEqual(r.result.tools.length, 8);
        const names = r.result.tools.map(function (t) { return t.name; });
        assert.ok(names.indexOf('query_scene_tree') >= 0);
        assert.ok(names.indexOf('execute_script') >= 0);
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
        console.log('        版本 = ' + info.version + '，场景 = ' + info.scenes.length + ' 个');
        console.log('        场景：' + info.scenes.join(', '));
    });

    console.log('\n=== 文件操作 ===');

    await check('list_dir 列出 assets', async function () {
        const r = await callTool('list_dir', { path: 'assets' });
        assert.ok(r.count > 0);
        assert.ok(r.items.some(function (i) { return i.name === 'scene'; }), '没看到 scene 目录');
    });

    await check('read_file 读 project.json', async function () {
        const text = await callTool('read_file', { path: 'project.json' });
        // project.json 本身是合法 JSON，会被 callTool 一并解析成对象
        const asText = typeof text === 'string' ? text : JSON.stringify(text);
        assert.ok(asText.indexOf('version') >= 0, '内容里没有 version');
        assert.ok(asText.indexOf('2.4') >= 0, '没看到 2.4 版本号');
    });

    await check('write_file 写入后能读回', async function () {
        const p = 'temp/mcp-test-probe.txt';
        const content = 'probe-' + Date.now();
        await callTool('write_file', { path: p, content: content, });
        const back = await callTool('read_file', { path: p });
        assert.strictEqual(back, content);
    });

    await check('路径越界被拦截', async function () {
        const r = await callTool('read_file', { path: '../../../Windows/win.ini' });
        assert.ok(r.error, '应该报错但没报');
        assert.ok(r.error.indexOf('越界') >= 0, '错误信息不对：' + r.error);
    });

    console.log('\n=== 场景解析（核心）===');

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

    await check('节点树带位置和组件信息', async function () {
        const r = await callTool('query_scene_tree', { path: scenePath, maxDepth: 3 });
        let found = null;
        (function walk(n) {
            if (found) return;
            if (n.components && n.components.length > 0) { found = n; return; }
            (n.children || []).forEach(walk);
        })(r.tree);
        assert.ok(found, '整棵树没有挂任何组件，可疑');
        assert.ok(found.type, '节点缺 type');
        console.log('        示例节点 "' + found.name + '" 挂载：' +
            found.components.map(function (c) {
                return c.type + (c.isScript ? '(脚本)' : '');
            }).join(', '));
    });

    await check('maxDepth 生效（不展开到底）', async function () {
        const deep = await callTool('query_scene_tree', { path: scenePath, maxDepth: 100 });
        const shallow = await callTool('query_scene_tree', { path: scenePath, maxDepth: 1 });
        assert.ok(shallow.nodeCount <= deep.nodeCount, '浅层反而节点更多，maxDepth 没生效');
        console.log('        depth=1 → ' + shallow.nodeCount + ' 节点；depth=100 → ' + deep.nodeCount + ' 节点');
        if (shallow.nodeCount === deep.nodeCount) {
            console.log('        （该场景层级本身很浅，未能真正验证截断）');
        }
    });

    console.log('\n=== 其它工具 ===');

    await check('get_editor_log 能读到日志', async function () {
        const text = await callTool('get_editor_log', { lines: 5 });
        assert.ok(typeof text === 'string');
        assert.ok(text.length > 0);
    });

    await check('execute_script 能访问 Editor', async function () {
        const r = await callTool('execute_script', {
            code: 'return { project: Editor.Project.path, hasAssetdb: !!Editor.assetdb };'
        });
        assert.strictEqual(path.resolve(r.result.project), path.resolve(PROJECT));
        assert.strictEqual(r.result.hasAssetdb, true);
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
