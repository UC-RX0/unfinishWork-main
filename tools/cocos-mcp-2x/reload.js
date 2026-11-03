'use strict';

/**
 * 开发用热重载 —— 改完 main.js 跑一句 `node reload.js`，不用重启编辑器。
 *
 * 为什么需要它：
 *   Cocos Creator 2.4 的扩展加载器没有把 main.js 放进 require.cache，
 *   Editor.Package.reload('cocos-mcp-2x') 也返回 null，等于热重载是失效的。
 *   所以改成"自己关掉自己的 http server，再 require 一次新代码"。
 *
 * 只关 25900~25910 区间内的监听端口，不动别的扩展的 server。
 *
 * 用法：
 *   node reload.js            # 默认 25900
 *   node reload.js 25901      # 指定端口
 */

const http = require('http');

const PORT = parseInt(process.argv[2] || '25900', 10);

const CODE = [
    'var fs = require("fs");',
    'var dir = null;',
    'var paths = Editor.Package.paths || [];',
    'for (var i = 0; i < paths.length; i++) {',
    '    var p = paths[i] + "/cocos-mcp-2x";',
    '    if (fs.existsSync(p + "/main.js")) { dir = p; break; }',
    '}',
    'if (!dir) throw new Error("在 Editor.Package.paths 里找不到 cocos-mcp-2x");',
    'var closed = 0;',
    'process._getActiveHandles().forEach(function (h) {',
    '    if (!h || !h.listening || typeof h.address !== "function") return;',
    '    var a = h.address();',
    '    if (a && a.port >= 25900 && a.port <= 25910) { try { h.close(); closed++; } catch (e) {} }',
    '});',
    'setTimeout(function () {',
    // Windows 上 require.cache 的键是反斜杠，dir 里可能混了正斜杠，
    // 直接 indexOf 匹配不到，缓存清不干净就会 require 回旧模块
    '    var norm = function (s) { return String(s).replace(/\\\\/g, "/").toLowerCase(); };',
    '    var dirNorm = norm(dir);',
    '    var purged = 0;',
    '    Object.keys(require.cache).forEach(function (k) {',
    '        if (norm(k).indexOf(dirNorm) === 0) { delete require.cache[k]; purged++; }',
    '    });',
    '    var fresh = require(dir + "/main.js");',
    '    fresh.load();',
    '    Editor.log("[cocos-mcp-2x]", "热重载完成 closed=" + closed + " purged=" + purged);',
    '}, 500);',
    'return "scheduled: " + dir + " (closed=" + closed + ")";'
].join('\n');

function rpc(method, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
        const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params });
        const req = http.request({
            host: '127.0.0.1',
            port: PORT,
            path: '/mcp',
            method: 'POST',
            // 必须关掉连接复用。server.close() 不会断开已建立的 keep-alive 连接，
            // 复用旧 socket 的话轮询会一直读到已经关掉的那个旧实例。
            agent: false,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Connection': 'close'
            },
            timeout: timeoutMs || 8000
        }, function (res) {
            let data = '';
            res.on('data', function (c) { data += c; });
            res.on('end', function () {
                try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(data.slice(0, 200))); }
            });
        });
        req.on('timeout', function () { req.destroy(new Error('请求超时')); });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function infoOf(res) {
    const si = res && res.result && res.result.serverInfo;
    if (!si) return null;
    return { version: si.version, instanceId: si.instanceId || null };
}

async function main() {
    let before;
    try {
        before = infoOf(await rpc('initialize', {}));
    } catch (e) {
        console.error('连不上 127.0.0.1:' + PORT + ' —— 编辑器里的扩展没在跑？');
        console.error('  ' + e.message);
        process.exit(1);
    }
    console.log('当前实例 = v' + before.version + ' / ' + (before.instanceId || '无 instanceId'));

    const r = await rpc('tools/call', { name: 'execute_script', arguments: { code: CODE } });
    const text = r.result && r.result.content && r.result.content[0] ? r.result.content[0].text : JSON.stringify(r);
    if (r.result && r.result.isError) {
        console.error('重载指令执行失败：' + text);
        process.exit(1);
    }
    console.log('已下发：' + text.replace(/\s+/g, ' ').slice(0, 160));

    const sleep = function (ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); };

    // 等 instanceId 变。不靠"端口有没有断"来判断：
    // 旧实例 server.close() 之后 keep-alive 连接还可能应答一会儿，靠它判断会误判。
    for (let i = 0; i < 50; i++) {
        await sleep(250);
        let cur = null;
        try {
            cur = infoOf(await rpc('initialize', {}, 1500));
        } catch (e) {
            continue; // 端口正在换手
        }
        if (!cur) continue;
        if (process.env.VERBOSE === '1') {
            console.log('  poll#' + i + ' → v' + cur.version + ' / ' + cur.instanceId);
        }

        if (cur.instanceId && cur.instanceId !== before.instanceId) {
            console.log('热重载成功：v' + before.version + ' → v' + cur.version +
                '（新实例 ' + cur.instanceId + '）');
            return;
        }
        // 老版本还没有 instanceId 字段时的兜底
        if (!cur.instanceId && cur.version !== before.version) {
            console.log('热重载成功：v' + before.version + ' → v' + cur.version);
            return;
        }
    }
    console.error('等了 12 秒还没换实例，重载可能没生效');
    console.error('排查：读一下编辑器日志里的 [cocos-mcp-2x]，或在编辑器里手动重载扩展');
    process.exit(1);
}

main().catch(function (e) {
    console.error('重载异常：' + e.message);
    process.exit(1);
});
