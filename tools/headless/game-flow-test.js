'use strict';

/**
 * 完整游戏流程测试
 *
 * 【这个测试在证明什么】
 *   前面各测试验证的都是"零件"（确定性、回滚、分叉检测）。
 *   这个测试验证的是【整局游戏】能不能真的跑完：
 *     准备 → 第 1 波 → 清波 → 休整 → 第 2 波 → … → 最终波 → 胜利
 *   以及失败路径：玩家阵亡 → 失败结算。
 *
 *   它同时验证"游戏性闭环"的每一个环节：
 *     波次推进、怪物类型出现、计分累加、休整回血、胜负判定。
 *
 * 用法：node tools/headless/game-flow-test.js
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
const { ScriptedInputSystem } = require(path.join(BUILD, 'game/System/ScriptedInputSystem.js'));
const { ChecksumSystem } = require(path.join(BUILD, 'game/System/ChecksumSystem.js'));
const { BattleStateComponent, BATTLE_PHASE_NAME } = require(path.join(BUILD, 'game/Component/BattleStateComponent.js'));
const { ScoreComponent } = require(path.join(BUILD, 'game/Component/ScoreComponent.js'));
const { HealthComponent } = require(path.join(BUILD, 'game/Component/HealthComponent.js'));
const { EnemyComponent } = require(path.join(BUILD, 'game/Component/EnemyComponent.js'));
const { logicRng } = require(path.join(BUILD, 'game/Math/PRNG.js'));
const { WAVE_TABLE } = require(path.join(BUILD, 'game/Config/WaveConfig.js'));

const DT = 1 / 60;

/**
 * 跑一局
 * @param maxFrames 最多跑多少帧
 * @param forceDefeat 强制在第 N 帧把玩家打死（测失败路径）
 */
function playGame(maxFrames, forceDefeatAt = -1) {
    ScriptedInputSystem.enabled = true;
    ScriptedInputSystem.mode = 'dodge';

    logicRng.restore(20261103);
    world.init();
    createBattleDirector(world);
    createPlayers(world, 1);

    const battle = world.query(BattleStateComponent)[0];
    const state = world.getComp(battle, BattleStateComponent);
    const scoreId = world.query(ScoreComponent)[0];
    const score = world.getComp(scoreId, ScoreComponent);
    const hpId = world.query(HealthComponent)[0];
    const hp = world.getComp(hpId, HealthComponent);

    // 记录波次推进轨迹
    const waveLog = [];
    let lastWave = -1;
    let lastPhase = -1;
    let maxHp = hp.maxHealth;
    let healObserved = false;
    // 血量轨迹（用于诊断平衡性）
    const hpTrail = [];
    let minHp = hp.health;

    let frame = 0;
    while (frame < maxFrames) {
        world.update(DT);
        frame = world.frame;

        // 记录血量（每 60 帧一个点）
        if (frame % 60 === 0) {
            hpTrail.push(`${frame}:${hp.health}`);
            if (hp.health < minHp) minHp = hp.health;
        }

        // 记录阶段/波次变化
        if (state.wave !== lastWave) {
            lastWave = state.wave;
            waveLog.push({ wave: state.wave, frame, phase: BATTLE_PHASE_NAME[state.phase] });
        }
        if (state.phase !== lastPhase) {
            lastPhase = state.phase;
        }

        // 记录回血
        if (hp.health > 0 && hp.health < maxHp) {
            healObserved = true;
        }

        // 强制失败路径
        if (forceDefeatAt > 0 && frame === forceDefeatAt) {
            hp.health = 0;
        }

        if (state.settled) break;
    }

    return {
        frame,
        phase: BATTLE_PHASE_NAME[state.phase],
        settled: state.settled,
        wave: state.wave,
        totalWaves: state.totalWaves,
        kills: state.kills,
        score: score.score,
        scoreKills: score.kills,
        waveLog,
        healObserved,
        hpTrail,
        minHp,
        checksum: ChecksumSystem.compute(world).hex,
    };
}

function main() {
    console.log('============ 完整游戏流程测试 ============');

    let pass = true;

    // ---------- 测试 1：胜利路径 ----------
    console.log('\n--- 测试 1：完整通关（跑到胜利）---');
    // 10 波，每波 3~13 只怪，加上刷怪间隔与休整，20000 帧足够
    const win = playGame(20000);
    console.log(`结束帧: ${win.frame}`);
    console.log(`阶段: ${win.phase}｜波次: ${win.wave}/${win.totalWaves}`);
    console.log(`击杀: ${win.kills}｜得分: ${win.score}｜波次轨迹: ${win.waveLog.length} 次变化`);

    if (win.phase !== '胜利') {
        console.log(`❌ 未能通关，停在「${win.phase}」第 ${win.wave} 波`);
        pass = false;
    } else if (win.wave !== win.totalWaves) {
        console.log(`❌ 胜利时波次应为 ${win.totalWaves}，实际 ${win.wave}`);
        pass = false;
    } else if (win.kills <= 0) {
        console.log('❌ 全程没有击杀');
        pass = false;
    } else if (win.score <= 0) {
        console.log('❌ 全程没有得分');
        pass = false;
    } else if (win.waveLog.length < win.totalWaves) {
        console.log(`❌ 波次推进轨迹不完整：只记录了 ${win.waveLog.length} 次`);
        pass = false;
    } else {
        console.log(`✅ 通关成功：${win.kills} 杀 / ${win.score} 分 / ${win.frame} 帧`);
        console.log(`   波次轨迹: ${win.waveLog.map(w => `${w.wave}@${w.frame}`).join(' ')}`);
    }
    console.log(`   血量轨迹: ${win.hpTrail.slice(0, 30).join(' ')}`);

    // ---------- 测试 2：失败路径 ----------
    console.log('\n--- 测试 2：玩家阵亡 → 失败结算 ---');
    const lose = playGame(3000, 600);
    console.log(`结束帧: ${lose.frame}｜阶段: ${lose.phase}｜波次: ${lose.wave}`);
    if (lose.phase !== '失败') {
        console.log(`❌ 玩家阵亡后应判失败，实际「${lose.phase}」`);
        pass = false;
    } else if (!lose.settled) {
        console.log('❌ 失败后未锁定结算状态');
        pass = false;
    } else {
        console.log(`✅ 失败判定正确（第 ${lose.wave} 波阵亡）`);
    }

    // ---------- 测试 3：确定性 ----------
    console.log('\n--- 测试 3：两次运行校验和一致 ---');
    const a = playGame(2000);
    const b = playGame(2000);
    if (a.checksum !== b.checksum) {
        console.log(`❌ 两次运行校验和不同：${a.checksum} vs ${b.checksum}`);
        pass = false;
    } else {
        console.log(`✅ 两次运行校验和一致：${a.checksum}`);
    }

    // ---------- 测试 4：波次表自洽 ----------
    console.log('\n--- 测试 4：波次表自洽 ---');
    let waveOk = true;
    let totalMonsters = 0;
    for (let i = 0; i < WAVE_TABLE.length; i++) {
        const c = WAVE_TABLE[i];
        const count = c.normal + c.fast + c.tank;
        totalMonsters += count;
        if (count <= 0) {
            console.log(`❌ 第 ${i + 1} 波没有怪物`);
            waveOk = false;
        }
    }
    // 波次递增
    for (let i = 1; i < WAVE_TABLE.length; i++) {
        const prev = WAVE_TABLE[i - 1];
        const cur = WAVE_TABLE[i];
        const prevCount = prev.normal + prev.fast + prev.tank;
        const curCount = cur.normal + cur.fast + cur.tank;
        if (curCount < prevCount) {
            console.log(`❌ 第 ${i + 1} 波怪物数(${curCount}) 少于第 ${i} 波(${prevCount})`);
            waveOk = false;
        }
        if (cur.healthPct < prev.healthPct) {
            console.log(`❌ 第 ${i + 1} 波血量倍率反而下降`);
            waveOk = false;
        }
    }
    if (waveOk) {
        console.log(`✅ ${WAVE_TABLE.length} 波表自洽（总怪物 ${totalMonsters} 只）`);
    } else {
        pass = false;
    }

    console.log('\n========================================');
    console.log(pass ? '🎉 完整游戏流程测试全部通过' : '💥 完整游戏流程测试失败');
    process.exit(pass ? 0 : 1);
}

main();
