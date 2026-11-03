'use strict';

/**
 * 帧同步定序服务端
 *
 * 设计原则：服务端【不跑任何游戏逻辑】。
 * 它只做三件事：
 *   1. 按固定帧率推进全局帧号
 *   2. 把每个玩家"最近一次上报的输入"盖章到当前帧
 *   3. 把这一帧的完整输入广播给所有人，并比对校验和
 *
 * 为什么服务端不跑逻辑：
 *   帧同步的权威性来自"所有人拿到同一份输入"，而不是"服务端算出结果"。
 *   服务端一旦参与模拟，就要承担全部算力，也就退化成状态同步了。
 *
 * 输入归属说明：
 *   本实现是"服务端采样"——客户端持续上报当前输入状态，
 *   服务端在每一帧取各玩家最近一次上报值并盖章。
 *   这样输入归属由服务端唯一决定，所有客户端收到的帧包完全一致，
 *   模拟仍然是确定的；代价是本地操作会有一个往返延迟（约 1~2 帧）。
 *   要消除这个延迟需要客户端预测 + 回滚，那是下一阶段的事。
 */

const { WebSocketServer } = require('ws');

/**逻辑帧率，必须与客户端 BATTLE_CONFIG.logicFps 一致*/
const LOGIC_FPS = 60;
const FRAME_MS = Math.round(1000 / LOGIC_FPS);
/**房间人数上限*/
const MAX_PLAYERS = 2;
/**端口*/
const PORT = 7788;
/**固定随机种子，由服务端下发，保证所有客户端初始随机序列一致*/
const SEED = 20261103;

const wss = new WebSocketServer({ port: PORT });

/**ws -> { index, last: {dirX,dirY,speed,fire} }*/
const clients = new Map();
/**最近一次校验和：frame -> { playerIndex -> hex }*/
const checksums = new Map();

let nextIndex = 0;
let frame = 0;
let loop = null;

function send(ws, obj) {
    if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function broadcast(obj) {
    const text = JSON.stringify(obj);
    for (const ws of clients.keys()) {
        if (ws.readyState === 1) ws.send(text);
    }
}

function roster() {
    return Array.from(clients.values()).map((c) => c.index);
}

function startLoop() {
    if (loop) return;
    loop = setInterval(tick, FRAME_MS);
    console.log(`[server] 帧循环启动 @${LOGIC_FPS}fps (${FRAME_MS}ms/帧)`);
}

function stopLoop() {
    if (!loop) return;
    clearInterval(loop);
    loop = null;
    console.log('[server] 帧循环停止');
}

function tick() {
    if (clients.size === 0) return;
    frame++;

    // 每个玩家取"最近一次上报的输入"，盖章到本帧
    const inputs = [];
    for (const c of clients.values()) {
        inputs.push({
            frame,
            playerIndex: c.index,
            dirX: c.last.dirX,
            dirY: c.last.dirY,
            speed: c.last.speed,
            fire: c.last.fire,
        });
    }

    broadcast({ t: 'frame', frame, inputs });

    // 只保留最近 2 秒的校验和，避免无限增长
    if (checksums.size > LOGIC_FPS * 2) {
        const cutoff = frame - LOGIC_FPS * 2;
        for (const key of checksums.keys()) {
            if (key < cutoff) checksums.delete(key);
        }
    }
}

/**比对同一帧不同客户端上报的校验和*/
let checksumCount = 0;
function compareChecksum(msg, playerIndex) {
    checksumCount++;
    // 每收到 60 次上报打一行，用来确认客户端确实在上报（排查链路用）
    if (checksumCount % 60 === 1) {
        console.log(`[server] 收到校验和 #${checksumCount} frame=${msg.frame} sum=${msg.sum} from P${playerIndex}`);
    }

    const key = msg.frame;
    let bucket = checksums.get(key);
    if (!bucket) {
        bucket = new Map();
        checksums.set(key, bucket);
    }
    bucket.set(playerIndex, msg.sum);

    if (bucket.size >= 2) {
        const values = Array.from(bucket.values());
        const first = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== first) {
                console.log(`[server] !! 分叉 frame=${key}`, Array.from(bucket.entries()));
                broadcast({ t: 'desync', frame: key, detail: Array.from(bucket.entries()) });
                return;
            }
        }
    }
}

wss.on('connection', (ws) => {
    if (clients.size >= MAX_PLAYERS) {
        send(ws, { t: 'full', maxPlayers: MAX_PLAYERS });
        ws.close();
        return;
    }

    const index = nextIndex++;
    clients.set(ws, { index, last: { dirX: 0, dirY: 0, speed: 0, fire: false } });
    console.log(`[server] 玩家 ${index} 加入，当前 ${clients.size} 人`);

    send(ws, {
        t: 'welcome',
        playerIndex: index,
        seed: SEED,
        playerCount: clients.size,
        frame,
        logicFps: LOGIC_FPS,
    });
    broadcast({ t: 'roster', players: roster() });
    startLoop();

    ws.on('message', (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch (e) {
            return;
        }
        const client = clients.get(ws);
        if (!client) return;

        if (msg.t === 'input') {
            client.last = {
                dirX: msg.dirX | 0,
                dirY: msg.dirY | 0,
                speed: msg.speed | 0,
                fire: !!msg.fire,
            };
        } else if (msg.t === 'checksum') {
            compareChecksum(msg, client.index);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        nextIndex = Math.max(0, nextIndex - 1);
        console.log(`[server] 玩家 ${index} 离开，当前 ${clients.size} 人`);
        broadcast({ t: 'roster', players: roster() });
        if (clients.size === 0) stopLoop();
    });
});

console.log(`[server] 监听 ws://127.0.0.1:${PORT}  最多 ${MAX_PLAYERS} 人`);
