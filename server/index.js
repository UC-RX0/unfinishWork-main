'use strict';

/**
 * 帧同步定序服务端
 *
 * 设计原则：服务端【不跑任何游戏逻辑】。
 * 它只做三件事：
 *   1. 按固定帧率推进全局帧号
 *   2. 把每个玩家"针对该帧上报的输入"盖章到该帧
 *   3. 把这一帧的完整输入广播给所有人，并比对校验和
 *
 * 为什么服务端不跑逻辑：
 *   帧同步的权威性来自"所有人拿到同一份输入"，而不是"服务端算出结果"。
 *   服务端一旦参与模拟，就要承担全部算力，也就退化成状态同步了。
 *
 * 输入归属说明：
 *   客户端上报时【带帧号】（msg.frame），服务端按帧号存，
 *   到该帧时取出各玩家的输入盖章广播。
 *   这样客户端可以立刻用自己的输入跑预测帧，
 *   服务端回传的权威值与它采样时逐位相同 → 本地输入永不触发回滚。
 *   会分歧的只有远端玩家的输入，由客户端的回滚机制修正。
 *
 * 兼容：仍然接受不带帧号的旧格式输入（按"最近一次上报"处理），
 *   这样老的测试客户端也能连上。
 */

const { WebSocketServer } = require('ws');

/**逻辑帧率，必须与客户端 BATTLE_CONFIG.logicFps 一致*/
const LOGIC_FPS = 60;
const FRAME_MS = Math.round(1000 / LOGIC_FPS);
/**房间人数上限*/
const MAX_PLAYERS = 2;
/**
 * 开局所需人数。
 * 帧同步要求所有客户端从【同一帧、同一份世界】开始跑，
 * 所以房间没满之前不发帧 —— 否则先到的人不知道后到的人存在，
 * 两端实体集合不同，必然分叉。
 * 单人调试可以设 LOCKSTEP_MIN_PLAYERS=1。
 */
const MIN_PLAYERS = Math.min(MAX_PLAYERS, Number(process.env.LOCKSTEP_MIN_PLAYERS || MAX_PLAYERS));
/**端口*/
const PORT = 7788;
/**固定随机种子，由服务端下发，保证所有客户端初始随机序列一致*/
const SEED = 20261103;

const wss = new WebSocketServer({ port: PORT });

/**
 * ws -> { index, byFrame: Map<frame, input>, last: {dirX,dirY,speed,fire} }
 *
 * byFrame：客户端按帧号上报的输入（带帧号的新协议）
 * last：最近一次上报（不带帧号的旧协议用）
 */
const clients = new Map();
/**最近一次校验和：frame -> { playerIndex -> hex }*/
const checksums = new Map();

let nextIndex = 0;
let frame = 0;
let loop = null;
/**是否已开局*/
let started = false;
/**各客户端最近一次上报的帧号，用于观察客户端推进速度 */
const clientFrames = new Map();

/**
 * 房间人数够了才开局。
 * 开局前不发任何帧，所有客户端都用同一份 roster 建世界。
 */
function maybeStart() {
    if (started) return;
    if (clients.size < MIN_PLAYERS) {
        console.log(`[server] 等待开局：${clients.size}/${MIN_PLAYERS} 人`);
        return;
    }
    started = true;
    console.log(`[server] 房间成型（${clients.size} 人），开局，起始帧=${frame}`);
    broadcast({ t: 'start', playerCount: clients.size, seed: SEED, frame, logicFps: LOGIC_FPS });
    startLoop();
}

/**
 * 所有在线客户端是否都上报了 targetFrame 帧的输入。
 * 这是"按帧号盖章"的前提 —— 输入没到齐就不能盖章，否则会盖错。
 */
function hasAllInputs(targetFrame) {
    for (const c of clients.values()) {
        if (!c.byFrame.has(targetFrame)) return false;
    }
    return true;
}

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

    // 【关键】只有当所有在线客户端都上报了【下一帧】的输入，才广播这一帧。
    //
    // 为什么必须等：
    //   客户端按帧号上报（msg.frame），服务端按帧号盖章。
    //   如果不等就广播，服务端会用"最近一次上报"盖上还没到的帧的章 ——
    //   那个值属于别的帧，客户端比对时会误判成分歧，产生无谓的回滚。
    //
    // 代价：服务端会落后客户端（这是帧同步的本质）。
    // 客户端用【预测】来补偿 —— 本地输入立即生效，不等权威帧。
    const next = frame + 1;
    if (!hasAllInputs(next)) {
        // 输入没到齐，这一帧先不广播，等下一轮 tick 再试
        return;
    }

    frame = next;

    // 每秒打一行客户端推进情况，用来观察客户端是否跟得上
    if (frame % 60 === 0) {
        const parts = Array.from(clientFrames.entries()).map(([i, f]) => `P${i}:${f}`).join(' ');
        console.log(`[server] 服务端帧=${frame} 客户端最新帧 ${parts || '(无)'}`);
    }

    // 每个玩家取"针对本帧上报的输入"，盖章到本帧
    const inputs = [];
    for (const c of clients.values()) {
        const byFrame = c.byFrame.get(frame);
        if (byFrame) {
            inputs.push({
                frame,
                playerIndex: c.index,
                dirX: byFrame.dirX,
                dirY: byFrame.dirY,
                speed: byFrame.speed,
                fire: byFrame.fire,
            });
            // 该帧的输入已盖章，用完即弃，避免无限增长
            c.byFrame.delete(frame);
        } else {
            // 理论上不会走到这里（hasAllInputs 保证了齐全），
            // 兜底用空输入，保证帧包里每个玩家都有一项
            inputs.push({
                frame,
                playerIndex: c.index,
                dirX: 0,
                dirY: 0,
                speed: 0,
                fire: false,
            });
        }
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
    clients.set(ws, {
        index,
        last: { dirX: 0, dirY: 0, speed: 0, fire: false },
        byFrame: new Map(),
    });
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
    maybeStart();

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
            // 带帧号的新协议：按帧号存，服务端到那一帧时盖章
            if (typeof msg.frame === 'number' && msg.frame > 0) {
                client.byFrame.set(msg.frame, client.last);
                // 清理过老的帧，避免客户端预测过远导致无限增长
                if (client.byFrame.size > 300) {
                    const oldest = Math.min(...client.byFrame.keys());
                    client.byFrame.delete(oldest);
                }
            }
        } else if (msg.t === 'checksum') {
            clientFrames.set(client.index, msg.frame);
            compareChecksum(msg, client.index);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        nextIndex = Math.max(0, nextIndex - 1);
        console.log(`[server] 玩家 ${index} 离开，当前 ${clients.size} 人`);
        broadcast({ t: 'roster', players: roster() });
        if (clients.size === 0) {
            stopLoop();
            started = false;
        }
    });
});

console.log(`[server] 监听 ws://127.0.0.1:${PORT}  最多 ${MAX_PLAYERS} 人`);
