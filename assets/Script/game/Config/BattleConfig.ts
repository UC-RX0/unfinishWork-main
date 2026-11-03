/**
 * @description 战斗逻辑常量配置
 *
 * 这里的每一个值都属于【逻辑层】，必须满足三条：
 *   1. 不依赖场景节点（旧代码从 Canvas 的 UITransform 读战场尺寸，属于逻辑读视图）
 *   2. 不依赖真实时间（时长一律用逻辑帧数表达）
 *   3. 不依赖随机（随机只能来自 PRNG）
 *
 * 帧同步下这些值必须对所有客户端完全一致，所以写死在代码里或由服务端下发，
 * 绝不能根据屏幕分辨率、设备性能动态变化。
 */
export const BATTLE_CONFIG = {
    //#region 时间
    /**逻辑帧率。所有"多少帧"的配置都以它为基准*/
    logicFps: 60,
    /**单帧步长（秒），仅用于给渲染层做插值换算，逻辑内部不要用它算时间*/
    get logicDt(): number { return 1 / this.logicFps; },
    /**
     * 单次渲染帧最多补跑多少逻辑帧。
     * 卡顿后如果无限补帧会形成死亡螺旋（越补越卡），超过上限就直接丢弃积压。
     */
    maxCatchUp: 8,
    //#endregion

    //#region 战场
    /**战场半宽（像素）。替代原先从 Canvas 读取的宽度/2*/
    fieldHalfWidth: 640,
    /**战场半高（像素）。替代原先从 Canvas 读取的高度/2*/
    fieldHalfHeight: 360,
    //#endregion

    //#region 刷怪
    /**刷怪间隔（逻辑帧）*/
    spawnIntervalFrames: 60,
    /**刷怪边距：在边界外多少像素生成，避免凭空出现在屏幕内*/
    spawnMargin: 40,
    //#endregion

    //#region 玩家
    /**玩家移动速度（像素/秒）*/
    playerSpeed: 100,
    /**玩家初始血量*/
    playerHealth: 10000,
    //#endregion

    //#region 怪物
    /**怪物追击速度*/
    enemyChaseSpeed: 80,
    /**怪物血量*/
    enemyHealth: 20,
    /**怪物攻击范围（像素），注意比较时用其平方*/
    enemyAttackRange: 80,
    //#endregion

    //#region 子弹
    /**子弹速度*/
    bulletSpeed: 300,
    /**子弹伤害*/
    bulletDamage: 10,
    /**子弹命中判定半径*/
    bulletHitRadius: 70,
    //#endregion

    //#region 确定性
    /**
     * 逻辑随机种子。
     * 单机调试时固定值即可；接入服务端后由服务器在开局握手时下发，保证全场一致。
     */
    randomSeed: 20261103,
    //#endregion

    //#region 网络
    /**
     * 联机开关。
     * false：本地单机，输入由 LocalInputSource 采样
     * true ：连接帧同步服务端，输入由 NetworkInputSource 从帧包解出
     */
    net: {
        /**
         * 联机开关。默认关闭 = 单机模式（输入由 LocalInputSource 采样）。
         * 打开前请先启动服务端：cd server && npm start
         * 连不上会自动降级回单机，不会卡住游戏启动。
         */
        enabled: false,
        url: "ws://127.0.0.1:7788",
        maxPlayers: 2,
    },
    //#endregion
};
