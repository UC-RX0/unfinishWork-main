'use strict';

/**
 * 回滚正确性验证（权威 vs 预测）
 *
 * 【这个测试在证明什么】
 *   "两端一致"不等于"正确"。
 *   两个客户端可能因为同样的 bug 一起错，校验和照样一致。
 *
 *   所以这里做的是【绝对正确性】验证：
 *     1. 用【纯权威输入】从头跑一遍 → 得到基准校验和
 *     2. 用【预测 + 回滚】跑一遍 → 得到实际校验和
 *     3. 两者必须逐位相同
 *
 *   只要回滚逻辑有任何偏差（重演用了错的输入、快照漏了某个状态、
 *   实体顺序变了、随机数序列错了），校验和就会不同。
 *
 * 用法：node tools/headless/rollback-verify.js
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

const LOCAL = 0;
const REMOTE = 1;

/**本地玩家的输入：全局一致（预测值 = 权威值，永不分歧）*/
function localInput(f) {
    return { frame: f, playerIndex: LOCAL, dirX: 300, dirY: 0, speed: 800, fire: f % 30 < 10 };
}

/**
 * 远端玩家的权威输入：每 TURN 帧变一次方向（制造预测分歧）
 */
function remoteAuthoritative(f, turn) {
    const seg = Math.floor(f / turn) % 4;
    const dirs = [[900, 0], [0, 900], [-900, 0], [0, -900]];
    return { frame: f, playerIndex: REMOTE, dirX: dirs[seg][0], dirY: dirs[seg][1], speed: 500, fire: false };
}

/**
 * 纯权威运行：每一帧都用权威输入，不预测不回滚
 */
function runAuthoritative(frames, turn) {
    logicRng.restore(20261103);
    world.init();
    world.setStartFrame(0);
    createBattleDirector(world);
    createPlayers(world, 1);

    for (let f = 1; f <= frames; f++) {
        const map = new Map();
        map.set(LOCAL, localInput(f));
        map.set(REMOTE, remoteAuthoritative(f, turn));
        map.forEach((input) => world.getInputBuffer().push(input));
        world.setFrame(f);
        world.stepFrame();
    }
    return ChecksumSystem.compute(world).hex;
}

/**
 * 预测 + 回滚运行
 */
function runWithRollback(frames, turn, latency) {
    logicRng.restore(20261103);
    world.init();
    world.setStartFrame(0);
    createBattleDirector(world);
    createPlayers(world, 1);

    const rollback = new RollbackController(world, world.getInputBuffer());
    rollback.setLocalPlayer(LOCAL, 2);

    // 客户端的预测器：远端用"最近一次权威值"
    rollback.predictInputs = (f) => {
        const map = new Map();
        map.set(LOCAL, localInput(f));
        const last = rollback.getLastKnownInput(REMOTE);
        map.set(REMOTE, last
            ? { frame: f, playerIndex: REMOTE, dirX: last.dirX, dirY: last.dirY, speed: last.speed, fire: last.fire }
            : { frame: f, playerIndex: REMOTE, dirX: 0, dirY: 0, speed: 0, fire: false });
        return map;
    };

    world.setRollbackController(rollback);

    // 网络管道：权威帧延迟 LATENCY 帧到达
    const inFlight = [];
    for (let f = 1; f <= frames; f++) {
        // 本帧使用的输入（本地立即采样，远端用预测）
        const used = new Map();
        used.set(LOCAL, localInput(f));
        const last = rollback.getLastKnownInput(REMOTE);
        used.set(REMOTE, last
            ? { frame: f, playerIndex: REMOTE, dirX: last.dirX, dirY: last.dirY, speed: last.speed, fire: last.fire }
            : { frame: f, playerIndex: REMOTE, dirX: 0, dirY: 0, speed: 0, fire: false });
        used.forEach((input) => world.getInputBuffer().push(input));
        rollback.recordUsed(f, used);

        world.setFrame(f);
        world.stepFrame();
        rollback.captureFrame(f);

        // 权威帧进入网络管道
        inFlight.push({ frame: f, inputs: [localInput(f), remoteAuthoritative(f, turn)] });

        // 延迟到达
        if (inFlight.length > latency) {
            const arrived = inFlight.shift();
            rollback.enqueueAuthoritativeFrame(arrived.frame, arrived.inputs);
        }

        // 处理到期的权威帧 → 可能触发回滚
        rollback.processPending();
    }

    // 收尾
    while (inFlight.length > 0) {
        const arrived = inFlight.shift();
        rollback.enqueueAuthoritativeFrame(arrived.frame, arrived.inputs);
    }
    rollback.processPending();

    return {
        sum: ChecksumSystem.compute(world).hex,
        rollbacks: rollback.rollbackCount,
        settled: rollback.settled,
        settledSum: rollback.getSettledChecksum(rollback.settled),
    };
}

function main() {
    const FRAMES = 600;
    const TURN = 45;      // 远端每 45 帧变一次方向
    const LATENCY = 6;    // 模拟网络延迟 6 帧

    console.log('============ 回滚绝对正确性验证 ============');
    console.log(`帧数 ${FRAMES}｜远端转向周期 ${TURN} 帧｜模拟延迟 ${LATENCY} 帧`);

    const baseline = runAuthoritative(FRAMES, TURN);
    const actual = runWithRollback(FRAMES, TURN, LATENCY);

    console.log(`纯权威基准校验和: ${baseline}`);
    console.log(`预测+回滚校验和:   ${actual.sum}`);
    console.log(`回滚次数: ${actual.rollbacks}｜已结算帧: ${actual.settled}`);

    let pass = true;
    if (actual.rollbacks === 0) {
        console.log('❌ 没有触发回滚 —— 测试无效');
        pass = false;
    } else if (actual.sum !== baseline) {
        console.log('❌ 回滚后状态与纯权威基准不一致 —— 回滚逻辑有偏差');
        pass = false;
    } else {
        console.log('✅ 回滚后状态与纯权威基准逐位一致');
    }

    process.exit(pass ? 0 : 1);
}

main();
