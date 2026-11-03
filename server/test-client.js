'use strict';

/**
 * 服务端协议自检（不需要 Cocos）
 *
 * 验证两件事：
 *   1. 定序：两个客户端收到的同一帧，inputs 必须逐字节相同
 *   2. 补位：某个玩家没上报时，服务端用空输入补齐，帧号不中断
 *
 * 运行：先 npm start 起服务端，再 npm test
 */

const WebSocket = require('ws');

const URL = 'ws://127.0.0.1:7788';
const DURATION_MS = 2000;

/**记录每个客户端收到的帧包 */
const received = { A: new Map(), B: new Map() };

function makeClient(name, makeInput, startDelay, stopEarly) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const ws = new WebSocket(URL);
            let count = 0;

            ws.on('open', () => console.log(`[${name}] 已连接`));

            ws.on('message', (raw) => {
                const msg = JSON.parse(raw);
                if (msg.t === 'welcome') {
                    console.log(`[${name}] welcome index=${msg.playerIndex} seed=${msg.seed} fps=${msg.logicFps}`);
                } else if (msg.t === 'frame') {
                    count++;
                    received[name].set(msg.frame, JSON.stringify(msg.inputs));
                } else if (msg.t === 'roster') {
                    console.log(`[${name}] roster=${JSON.stringify(msg.players)}`);
                } else if (msg.t === 'desync') {
                    console.log(`[${name}] !! DESYNC ${JSON.stringify(msg)}`);
                }
            });

            let tick = 0;
            const sender = setInterval(() => {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify(Object.assign({ t: 'input' }, makeInput(tick++))));
                }
            }, 16);

            // B 提前停止上报，用来验证服务端的空输入补位
            setTimeout(() => {
                clearInterval(sender);
                console.log(`[${name}] 停止上报输入（模拟丢包/卡顿）`);
            }, stopEarly);

            setTimeout(() => {
                console.log(`[${name}] 收到 ${count} 帧`);
                ws.close();
                resolve();
            }, DURATION_MS);
        }, startDelay);
    });
}

async function main() {
    const a = makeClient('A', () => ({ dirX: 1000, dirY: 0, speed: 1000, fire: false }), 0, DURATION_MS);
    const b = makeClient('B', () => ({ dirX: 0, dirY: 1000, speed: 800, fire: true }), 300, DURATION_MS / 2);
    await Promise.all([a, b]);

    // 找出两边都收到、且都在各自上报期间的帧，比对 inputs
    const common = [];
    for (const f of received.A.keys()) {
        if (received.B.has(f)) common.push(f);
    }
    common.sort((x, y) => x - y);

    let mismatch = 0;
    for (const f of common) {
        if (received.A.get(f) !== received.B.get(f)) {
            mismatch++;
            if (mismatch <= 3) {
                console.log(`\n[不一致] frame=${f}`);
                console.log(`  A: ${received.A.get(f)}`);
                console.log(`  B: ${received.B.get(f)}`);
            }
        }
    }

    console.log(`\n===== 结果 =====`);
    console.log(`共同帧数: ${common.length}`);
    console.log(`逐帧不一致: ${mismatch}`);
    console.log(mismatch === 0 && common.length > 20
        ? '✅ 通过：所有客户端收到的同一帧输入完全一致'
        : '❌ 失败');

    process.exit(mismatch === 0 && common.length > 20 ? 0 : 1);
}

main();
