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
const { NetworkInputSource } = require(path.join(BUILD, 'game/Net/NetworkInputSource.js'));
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

    const source = new NetworkInputSource(world.getInputBuffer(), net);
    source.localPlayerIndex = myIndex;
    net.onFrame = (msg) => source.applyFrame(msg);
    net.onRoster = (players) => world.setPlayerCount(players.length);
    world.setInputSource(source, start.playerCount);

    // 导演实体与玩家实体都必须两端一致，否则实体集合不同必然分叉
    createBattleDirector(world);
    createPlayers(world, start.playerCount);

    // 定期把校验和上报给服务端，服务端负责跨客户端比对
    ChecksumSystem.onChecksum = (frame, hex) => net.sendChecksum(frame, hex);

    let sample = null;
    const DT = 1 / 60;
    let guard = 0;
    while (world.frame < TARGET_FRAME && guard < TARGET_FRAME * 40) {
        world.update(DT);
        if (sample === null && world.frame >= SAMPLE_FRAME) {
            sample = { frame: world.frame, sum: ChecksumSystem.compute(world).hex };
        }
        await sleep(1);
        guard++;
    }

    const result = {
        playerIndex: myIndex,
        frames: world.frame,
        sample,
        finalSum: ChecksumSystem.compute(world).hex,
    };
    console.log('CLIENT_RESULT ' + JSON.stringify(result));
    net.close();
}

main().catch((e) => {
    console.error('CLIENT_ERROR ' + (e && e.message ? e.message : String(e)));
    process.exit(1);
});
