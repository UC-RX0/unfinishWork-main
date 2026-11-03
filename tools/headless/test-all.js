'use strict';

/**
 * 统一测试入口
 *
 * 一次跑完全部验证，输出汇总。
 * 用法：
 *   node tools/headless/test-all.js          # 跳过联机测试
 *   node tools/headless/test-all.js --net    # 包含联机端到端测试
 */

const path = require('path');
const { spawnSync } = require('child_process');

const DIR = __dirname;
const WITH_NET = process.argv.includes('--net');

/**要跑的测试*/
const SUITES = [
    {
        name: '单机确定性 + 四态覆盖 + 不变量',
        file: 'run.js',
        args: ['3000', 'combat'],
    },
    {
        name: '完整游戏流程（通关 / 失败 / 确定性 / 波次表）',
        file: 'game-flow-test.js',
        args: [],
    },
    {
        name: '回滚往返自检',
        file: 'rollback-test.js',
        args: [],
    },
    {
        name: '回滚绝对正确性（对比纯权威基准）',
        file: 'rollback-verify.js',
        args: [],
    },
];

if (WITH_NET) {
    SUITES.push({
        name: '帧同步端到端（两客户端 + 服务端）',
        file: 'net-test.js',
        args: ['900', '600'],
    });
}

console.log('==================================================');
console.log('  全部自动化验证');
console.log('==================================================\n');

const results = [];

for (const suite of SUITES) {
    process.stdout.write(`▶ ${suite.name}\n`);
    const proc = spawnSync(process.execPath, [path.join(DIR, suite.file), ...suite.args], {
        cwd: path.resolve(DIR, '../..'),
        encoding: 'utf8',
        timeout: 300000,
    });
    const output = (proc.stdout || '') + (proc.stderr || '');
    // 只显示结论行，隐藏过程噪音
    const lines = output.split('\n').filter(l =>
        l.includes('✅') || l.includes('❌') ||
        l.includes('checksum') || l.includes('states') ||
        l.includes('assertions') || l.includes('客户端A') || l.includes('客户端B')
    );
    for (const l of lines) console.log('  ' + l.trim());

    const pass = proc.status === 0;
    results.push({ name: suite.name, pass, status: proc.status });
    console.log('');
}

console.log('==================================================');
let allPass = true;
for (const r of results) {
    console.log(`${r.pass ? '✅' : '❌'} ${r.name}${r.pass ? '' : ` (exit=${r.status})`}`);
    if (!r.pass) allPass = false;
}
console.log('==================================================');
console.log(allPass ? '🎉 全部验证通过' : '💥 存在失败项');
process.exit(allPass ? 0 : 1);
