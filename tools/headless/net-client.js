'use strict';

/**
 * headless 帧同步客户端
 *
 * 用真实��游戏代码（World / Systems / NetClient / NetworkInputSource）连帧同步服务端，
 * 跑到指定帧后输出该帧的世界校验和。
 *
 * 用法：node tools/headless/net-client.js <url> <目标帧数> <采样帧号>
 *   例：node tools/headless/net-client.js ws://127.0.0.1:7788 900 600
 *
 * 两个客户端跑出来的采样帧校验和必须完全一致，否则就是分叉。
 */

const path = require('path');
const Module = require('module');

//#region 引擎打桩
const ccStub = require('./stub/cc.js');
const resBridgeStub = require('./stub/resbridge.js');
const uiManagerStub = require('./stub/uimanager.js');

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === 'cc') return ccStub;
    if (/ResBridge$/.test(request)) return resBridgeStub;
    if (/UIManager$/.test(request)) return uiManagerStub;
    return origLoad.apply(this, arguments);
};
//#endregion

const BUILD = path.resolve(__dirname, '../../temp/headless-build/assets/Script');
const { world } = require(path.join(BUILD, 'game/World.js'));
const { createBattleDirector, createPlayers } = require(path.join(BUILD, 'game/SceneBuilder.js'));
const { NetClient } = require(path.join(BUILD, 'game/Net/NetClient.js'));
const { PredictiveInputSource } = require(path.join(BUILD, 'game/Net/PredictiveInputSource.js'));
const { RollbackController } = require(path.join(BUILD, 'game/Net/RollbackController.js'));
const { ScriptedInputSystem } = require(path.join(BUILD, 'game/System/ScriptedInputSystem.js'));
const { ChecksumSystem } = require(path.join(BUILD, 'game/System/ChecksumSystem.js'));
const { logicRng } = require(path.join(BUILD, 'game/Math/PRNG.js'));

const URL = process.argv[2] || 'ws://127.0.0.1:7788';
const TARGET_FRAME = Number(process.argv[3] || 900);
const SAMPLE_FRAME = Number(process.argv[4] || 600);

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    const net = new NetClient();
    const welcome = await net.connect(URL, 8000);
    const myIndex = welcome.playerIndex;

    // 等房间成型：人数没定下来之前不能建世界，否则两端实体集合不同必然分叉
    if (!net.startMsg) {
        await new Promise((resolve) => { net.onStart = () => resolve(); });
    }
    const start = net.startMsg;

    // 脚本输入控制的是"我"这个玩家
    ScriptedInputSystem.enabled = true;
    ScriptedInputSystem.mode = 'orbit';
    ScriptedInputSystem.localPlayerIndex = myIndex;

    logicRng.restore(start.seed);
    world.init();
    world.setStartFrame(start.frame);
    world.setPlayerCount(start.playerCount);
    world.networkMode = true;

    // 预测回滚：本地输入立即生效，权威帧到了之后比对修正
    const rollback = new RollbackController(world, world.getInputBuffer());
    rollback.setLocalPlayer(myIndex, start.playerCount);

    const source = new PredictiveInputSource(world.getInputBuffer(), net, rollback);
    source.localPlayerIndex = myIndex;
    net.onFrame = (msg) => source.applyFrame(msg);
    net.onRoster = (players) => world.setPlayerCount(players.length);
    world.setInputSource(source, start.playerCount);

    // 导演实体与玩家实体都必须两端一致，否则实体集合不同必然分叉
    createBattleDirector(world);
    createPlayers(world, start.playerCount);

    // 基线快照必须在建实体之后采集 —— 回滚到起始帧时玩家要在
    world.setRollbackController(rollback);

    // 开局上报：打破"等确认才能推进、但不推进就没有输入上报"的死锁
    source.bootstrap(start.frame, start.playerCount);

    // 校验和按帧号存档；上报只用【已结算帧】——
    // 当前帧可能含预测输入，拿去比对会产生假分叉
    ChecksumSystem.onFrameChecksum = (frame, hex) => rollback.captureChecksum(frame, hex);
    let lastReported = -1;

    let sample = null;
    const DT = 1 / 60;
    let guard = 0;
    // 按【真实时间】推进：客户端跑太快的话，帧号会远超服务端，
    // 服务端追不上就永远等不齐输入，测试就没意义了。
    const startTime = Date.now();
    while (world.frame < TARGET_FRAME && guard < TARGET_FRAME * 40) {
        world.update(DT);
        if (sample === null && world.frame >= SAMPLE_FRAME) {
            sample = { frame: world.frame, sum: ChecksumSystem.compute(world).hex };
        }
        // 定期上报已结算帧的校验和
        if (world.frame % 30 === 0) {
            const report = rollback.getReportableChecksum();
            if (report && report.frame !== lastReported) {
                lastReported = report.frame;
                net.sendChecksum(report.frame, report.hex);
            }
        }
        // 必须每轮都让出事件循环，否则 WebSocket 的帧包收不到：
        // 等第一帧时 world.frame 不推进，"真实时间对齐"的等待量恒为 0，
        // 循环就变成同步空转，事件循环被占满 → 永远收不到服务端回复。
        const elapsed = Date.now() - startTime;
        const expected = (world.frame - start.frame) * (1000 / 60);
        const wait = Math.max(1, Math.min(20, expected - elapsed));
        await sleep(wait);
        guard++;
    }

    const result = {
        playerIndex: myIndex,
        frames: world.frame,
        sample,
        // 已结算帧的校验和 —— 这才是能与其它客户端比对的
        settled: rollback.settled,
        settledSum: rollback.getSettledChecksum(rollback.settled),
        finalSum: ChecksumSystem.compute(world).hex,
        rollbacks: rollback.rollbackCount,
        lastRollbackFrames: rollback.lastRollbackFrames,
    };
    console.log('CLIENT_RESULT ' + JSON.stringify(result));
    net.close();
}

main().catch((e) => {
    console.error('CLIENT_ERROR ' + (e && e.message ? e.message : String(e)));
    process.exit(1);
});
