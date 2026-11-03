'use strict';

/**
 * headless 测试运行器
 *
 * 在 Node 里跑真实�� ECS 逻辑，不需要编辑器、不需要 Cocos 运行时。
 * 用途：
 *   - 确定性回归：跑两遍比对校验和
 *   - 战斗链路验证：脚本输入 + 状态统计，确认四态都走到
 *   - 联机验证：两个 headless 客户端同时连服务端，比对分叉
 *
 * 用法：
 *   node tools/headless/run.js [帧数] [模式]
 *     模式 combat   脚本输入 + 射击（默认）
 *     模式 idle     无输入（纯刷怪，用于确定性基线）
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
const { createPlayers } = require(path.join(BUILD, 'game/SceneBuilder.js'));
const { ScriptedInputSystem } = require(path.join(BUILD, 'game/System/ScriptedInputSystem.js'));
const { MonsterStateStats } = require(path.join(BUILD, 'game/Config/MonsterState.js'));
const { ChecksumSystem } = require(path.join(BUILD, 'game/System/ChecksumSystem.js'));
const { GameTestRunner } = require(path.join(BUILD, 'game/Test/GameTestRunner.js'));

const FRAMES = Number(process.argv[2] || 900);
const MODE = process.argv[3] || 'combat';

// 输入模式：combat 有脚本输入和射击，idle 完全没有输入
if (MODE === 'combat') {
    ScriptedInputSystem.enabled = true;
    ScriptedInputSystem.mode = 'orbit';
} else {
    ScriptedInputSystem.enabled = false;
    ScriptedInputSystem.mode = 'none';
}

// 运行时不变量断言：位置越界、血量异常、速度没归一化、实体泄漏
GameTestRunner.enabled = true;

world.init();
// 建实体用和编辑器完全相同的代码路径，保证两边行为一致
createPlayers(world, 1);

const DT = 1 / 60;
let guard = 0;
while (world.frame < FRAMES && guard < FRAMES * 8) {
    world.update(DT);
    guard++;
}

const result = {
    mode: MODE,
    frames: world.frame,
    checksum: ChecksumSystem.lastHex,
    states: MonsterStateStats.summary(),
    enterCount: MonsterStateStats.enterCount.slice(),
    assertions: GameTestRunner.violations,
};

console.log(JSON.stringify(result, null, 2));

if (result.assertions > 0) {
    console.log(`❌ 运行时不变量违规 ${result.assertions} 次`);
}

// 四态断言：Idle/Move/Attack/Hit/Dead 都必须走到过
if (MODE === 'combat') {
    const all = result.enterCount.every((c) => c > 0);
    console.log(all ? '✅ 四态全部覆盖' : '❌ 有状态未覆盖');
    process.exit(all && result.assertions === 0 ? 0 : 1);
}
