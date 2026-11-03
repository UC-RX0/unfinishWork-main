'use strict';

/**
 * 回滚控制器故障注入测试
 *
 * 【这个测试在证明什么】
 *   回滚机制最危险的地方在于：它"看起来能跑"，但结果算错了。
 *   肉眼完全看不出来 —— 画面正常、帧号正常，只有校验和会暴露差异。
 *
 *   所以这个测试用【故障注入】的方式主动制造分歧：
 *     1. 客户端用预测输入跑出一段世界状态（远端输入用"最后已知值"预测）
 *     2. 中途远端玩家真的动了，权威输入与预测不同
 *     3. 权威帧到达 → 触发回滚重演
 *     4. 比对回滚后的状态 vs "直接用权威输入从头跑一遍"的状态
 *
 *   两者必须【逐位一致】。不一致就说明回滚逻辑有 bug。
 *
 * 用法：node tools/headless/rollback-test.js
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
const { ChecksumSystem } = require(path.join(BUILD, 'game/System/ChecksumSystem.js'));
const { RollbackController } = require(path.join(BUILD, 'game/Net/RollbackController.js'));
const { logicRng } = require(path.join(BUILD, 'game/Math/PRNG.js'));

const DT = 1 / 60;
const LOCAL = 0;
const REMOTE = 1;

/**造一个确定性的输入（不用随机，保证测试可复现）*/
function makeInput(frame, playerIndex, dirX, dirY, speed, fire) {
    return { frame, playerIndex, dirX, dirY, speed, fire };
}

/**本地玩家的输入：全局一致，预测值 = 权威值（本地输入永不分歧）*/
function localInput(f) {
    return makeInput(f, LOCAL, 300, 0, 800, f % 30 < 10);
}

/**
 * 远端玩家的【权威】输入
 * 在 DIVERGE_AT 帧改变方向 —— 这就是"别人动了"
 */
function remoteAuthoritative(f, divergeAt) {
    const x = f >= divergeAt ? 900 : 100;
    return makeInput(f, REMOTE, x, 0, 500, false);
}

/**
 * 跑一个世界若干帧（没有预测、没有回滚，纯权威输入）
 */
function runAuthoritative(frames, divergeAt, startFrame = 0) {
    logicRng.restore(20261103);
    world.init();
    world.setStartFrame(startFrame);
    createBattleDirector(world);
    createPlayers(world, 1);

    for (let f = startFrame + 1; f <= startFrame + frames; f++) {
        const map = new Map();
        map.set(LOCAL, localInput(f));
        map.set(REMOTE, remoteAuthoritative(f, divergeAt));
        map.forEach((input) => world.getInputBuffer().push(input));
        world.setFrame(f);
        world.stepFrame();
    }
    return ChecksumSystem.compute(world).hex;
}

/**
 * 主测试
 */
function main() {
    const TOTAL = 400;
    const DIVERGE_AT = 200;

    // ---- 第一段：客户端带着预测跑，边跑边收权威帧 ----
    logicRng.restore(20261103);
    world.init();
    world.setStartFrame(0);
    createBattleDirector(world);
    createPlayers(world, 1);

    const rollback = new RollbackController(world, world.getInputBuffer());
    rollback.setLocalPlayer(LOCAL, 2);
    world.setRollbackController(rollback);

    // 客户端"最后已知的远端输入" —— 收到权威帧之前一直是旧值
    let lastKnownRemote = remoteAuthoritative(1, DIVERGE_AT);
    // 模拟网络延迟：权威帧每 LATENCY 帧才到一批
    const LATENCY = 10;
    // 待送达的权威帧
    const inFlight = [];

    for (let f = 1; f <= TOTAL; f++) {
        // 1. 本帧用的输入：本地用采样值，远端用"最后已知值"预测
        const used = new Map();
        used.set(LOCAL, localInput(f));
        used.set(REMOTE, makeInput(f, REMOTE, lastKnownRemote.dirX, lastKnownRemote.dirY, lastKnownRemote.speed, lastKnownRemote.fire));
        used.forEach((input) => world.getInputBuffer().push(input));
        rollback.recordUsed(f, used);

        // 2. 推进一帧
        world.setFrame(f);
        world.stepFrame();
        rollback.captureFrame(f);

        // 3. 服务端产生这一帧的权威输入，进入网络管道
        inFlight.push({
            frame: f,
            inputs: [localInput(f), remoteAuthoritative(f, DIVERGE_AT)],
        });

        // 4. 延迟 LATENCY 帧后到达
        if (inFlight.length > LATENCY) {
            const arrived = inFlight.shift();
            rollback.enqueueAuthoritativeFrame(arrived.frame, arrived.inputs);
            // 客户端更新"最后已知远端输入"
            for (const input of arrived.inputs) {
                if (input.playerIndex === REMOTE) lastKnownRemote = input;
            }
        }

        // 5. 处理到期的权威帧 → 可能触发回滚
        rollback.processPending();
    }

    // 收尾：把还在管道里的权威帧全部送达并处理
    while (inFlight.length > 0) {
        const arrived = inFlight.shift();
        rollback.enqueueAuthoritativeFrame(arrived.frame, arrived.inputs);
    }
    rollback.processPending();

    const afterRollback = ChecksumSystem.compute(world).hex;

    // ---- 第二段：直接用权威输入从头跑一遍（无预测、无回滚）----
    const reference = runAuthoritative(TOTAL, DIVERGE_AT, 0);

    // ---- 比对 ----
    console.log('================ 回滚故障注入测试 ================');
    console.log(`总帧数: ${TOTAL}｜分歧帧: ${DIVERGE_AT}｜模拟延迟: ${LATENCY} 帧`);
    console.log(`回滚次数: ${rollback.rollbackCount}（最近一次重演 ${rollback.lastRollbackFrames} 帧）`);
    console.log(`回滚后校验和:   ${afterRollback}`);
    console.log(`权威基准校验和: ${reference}`);

    const same = afterRollback === reference;
    const rolled = rollback.rollbackCount > 0;
    if (same && rolled) {
        console.log('✅ 回滚结果与权威基准逐位一致（且确实触发了回滚）');
    } else if (!rolled) {
        console.log('❌ 没有触发回滚 —— 分歧没被检测到，测试无效');
    } else {
        console.log('❌ 回滚结果与基准不一致 —— 回滚逻辑有 bug');
    }
    process.exit(same && rolled ? 0 : 1);
}

main();
