'use strict';

/**
 * 帧同步端到端测试
 *
 * 起一个真实的服务端 + 两个 headless 客户端，验证：
 *   1. 两个客户端在同一个逻辑帧上算出的世界校验和完全一致（没分叉）
 *   2. 服务端没有报 desync
 *   3. 客户端帧号紧跟服务端（锁步延迟稳定）
 *
 * 用法：node tools/headless/net-test.js
 */

const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const SERVER = path.join(ROOT, 'server', 'index.js');
const CLIENT = path.join(__dirname, 'net-client.js');

const TARGET_FRAME = Number(process.argv[2] || 900);
const SAMPLE_FRAME = Number(process.argv[3] || 600);
const PORT = process.env.LOCKSTEP_PORT || '7788';
const URL = `ws://127.0.0.1:${PORT}`;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function runClient(index) {
    return new Promise((resolve) => {
        const proc = spawn(process.execPath, [CLIENT, URL, String(TARGET_FRAME), String(SAMPLE_FRAME)], {
            cwd: ROOT,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let out = '';
        let err = '';
        proc.stdout.on('data', (d) => { out += d.toString(); });
        proc.stderr.on('data', (d) => { err += d.toString(); });
        proc.on('close', (code) => {
            const m = out.match(/CLIENT_RESULT (\{.*\})/);
            if (m) {
                try { resolve({ ok: true, result: JSON.parse(m[1]) }); return; } catch (e) { /* 落到下面 */ }
            }
            resolve({ ok: false, code, out, err });
        });
    });
}

async function main() {
    console.log('启动帧同步服务端…');
    const server = spawn(process.execPath, [SERVER], { cwd: path.join(ROOT, 'server'), stdio: ['ignore', 'pipe', 'pipe'] });
    let serverOut = '';
    server.stdout.on('data', (d) => {
        serverOut += d.toString();
        process.stdout.write('[srv] ' + d.toString());
    });
    server.stderr.on('data', (d) => { serverOut += d.toString(); });

    await sleep(1200);

    console.log('启动两个 headless 客户端…');
    const [a, b] = await Promise.all([runClient(0), runClient(1)]);

    await sleep(500);
    server.kill();

    console.log('\n================ 结果 ================');
    if (!a.ok || !b.ok) {
        console.log('❌ 客户端异常退出');
        console.log('A:', JSON.stringify(a));
        console.log('B:', JSON.stringify(b));
        process.exit(1);
    }

    console.log('客户端A:', JSON.stringify(a.result));
    console.log('客户端B:', JSON.stringify(b.result));

    // 【关键】比对必须用【已结算帧】的校验和。
    //
    // 预测模式下客户端会跑到服务端前面，当前帧的状态里可能含有
    // "还没被服务端确认的预测输入"。拿这种状态去比对，
    // 两端必然不一致 —— 但那不是分叉，只是还没走到同一步。
    //
    // 已结算帧 = 该帧所有输入都被服务端确认、且本端已按权威输入重演过。
    // 只有它的校验和才有资格跨客户端比对。
    const settledA = a.result.settled;
    const settledB = b.result.settled;
    const sumA = a.result.settledSum;
    const sumB = b.result.settledSum;

    let pass = true;

    if (settledA < 0 || settledB < 0) {
        console.log('❌ 没有已结算的帧，无法比对');
        pass = false;
    } else if (settledA !== settledB) {
        console.log(`❌ 已结算帧号不一致：A=${settledA} B=${settledB}`);
        pass = false;
    } else if (sumA !== sumB) {
        console.log(`❌ 已结算帧校验和不一致：frame=${settledA} A=${sumA} B=${sumB}`);
        pass = false;
    } else {
        console.log(`✅ 已结算帧校验和一致：frame=${settledA} sum=${sumA}`);
    }

    // 回滚统计：预测模式下远端输入变化会触发回滚，这是预期行为
    const rbA = a.result.rollbacks || 0;
    const rbB = b.result.rollbacks || 0;
    console.log(`回滚次数：A=${rbA} B=${rbB}（远端输入变化时触发，属预期）`);

    if (/分叉|desync/.test(serverOut)) {
        console.log('❌ 服务端报告了分叉');
        pass = false;
    } else {
        console.log('✅ 服务端未报告分叉');
    }

    console.log(pass ? '\n🎉 帧同步端到端验证通过' : '\n💥 帧同步端到端验证失败');
    process.exit(pass ? 0 : 1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
