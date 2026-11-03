import { AnimationClip, Asset, instantiate, Node, Prefab, SpriteFrame } from "cc";
import { resMgr } from "../manager/ResManager";
import { GAME_ASSETS, GAME_DIRS } from "./AssetManifest";

/**
 * @description 资源层启动阶段
 * 这是一个单向状态机：Idle → Loading → Sealed，不允许回退。
 */
export enum BootPhase {
    /**尚未开始预加载*/
    Idle = 0,
    /**预加载进行中，此时仍然允许异步*/
    Loading = 1,
    /**已封盘，此后运行期只允许同步访问，任何异步加载都会被拒绝*/
    Sealed = 2,
}

/**预加载进度回调载荷*/
export interface IBootProgress {
    /**总进度 0~1*/
    ratio: number;
    /**当前正在处理的资源标识，可用于 loading 界面文案*/
    label: string;
}

/**
 * @description 资源过渡层 ResBridge
 *
 * 存在的意义：
 *   ECS 是严格同步的架构 —— System.update() 必须在一帧内跑完并返回，
 *   无法容纳 await。而 Cocos 的资源加载天生异步。
 *   直接把 async 带进 ECS，会导致：
 *     1) System 内部逻辑被切割成多帧，实体状态出现"半初始化"中间态
 *     2) 谁都可能在任何地方触发隐式加载，卡顿位置不可预测
 *     3) 缺少资源时是运行期空引用崩溃，而不是启动期可发现的问题
 *
 * 因此用这一层把时间轴切成两段：
 *   【启动期】boot() 一次性把清单里的资源全部加载完 —— 唯一允许异步的地方
 *   【运行期】所有 get / spawn 都是纯内存读取 —— 零 await，缺失立即抛错
 *
 * 同时 boot() 结束时会把 ResManager 封盘（seal），
 * 之后任何绕过本层偷偷调用 resMgr.loadXxx 的代码都会直接抛异常，
 * 用编译期之外的手段把这个架构约束钉死。
 */
export class ResBridge {
    private static _instance: ResBridge = null;
    public static get instance(): ResBridge {
        if (!this._instance) {
            this._instance = new ResBridge();
        }
        return this._instance;
    }

    private constructor() { }

    //#region 状态
    private phase: BootPhase = BootPhase.Idle;
    /**资源层是否已就绪（封盘完成）*/
    public get isReady(): boolean { return this.phase === BootPhase.Sealed; }
    /**当前阶段*/
    public get currentPhase(): BootPhase { return this.phase; }
    //#endregion

    //#region 索引与缓存
    /**单资源索引  "key|name" -> Asset*/
    private assetIndex: Map<string, Asset> = new Map();
    /**预制体索引  "key|name" -> Prefab，避免每次 spawn 都做类型转换*/
    private prefabIndex: Map<string, Prefab> = new Map();
    /**目录索引  key -> Asset[]（已按名称自然排序）*/
    private dirIndex: Map<string, Asset[]> = new Map();
    /**预制体节点池  "key|name" -> Node[]*/
    private nodePools: Map<string, Node[]> = new Map();
    /**启动期收集的失败项*/
    private missingList: string[] = [];
    //#endregion

    //#region 启动期 · 唯一允许异步的地方
    /**
     * @description 预加载全部资源并封盘
     * 调用点只允许出现在游戏入口（GameLaunch.onLoad），且必须 await。
     * @param onProgress 进度回调，可用于驱动 loading 进度条
     */
    public async boot(onProgress?: (p: IBootProgress) => void): Promise<void> {
        if (this.phase === BootPhase.Sealed) {
            console.warn("[ResBridge] 已封盘，忽略重复 boot()");
            return;
        }
        if (this.phase === BootPhase.Loading) {
            console.warn("[ResBridge] boot() 正在执行中，忽略重复调用");
            return;
        }

        this.phase = BootPhase.Loading;
        this.missingList.length = 0;
        const startTime = Date.now();
        const total = GAME_DIRS.length + GAME_ASSETS.length;
        let finished = 0;
        const report = (label: string) => {
            finished++;
            if (onProgress) {
                onProgress({ ratio: total > 0 ? finished / total : 1, label });
            }
        };

        //#region 1. 目录加载（序列帧）—— 串行，保证进度回调连续可读
        for (let i = 0; i < GAME_DIRS.length; i++) {
            const decl = GAME_DIRS[i];
            try {
                await resMgr.loadDir(decl.key, decl.type || SpriteFrame);
                const raw = resMgr.getAssetsByKey(decl.key) || [];
                let assets: Asset[] = raw.map((item) => item.data);
                //loadDir 的返回顺序不保证与文件名顺序一致，序列帧必须排序
                if (decl.sort !== false) {
                    assets = this.naturalSort(assets);
                }
                if (assets.length === 0) {
                    this.missingList.push(`[目录] ${decl.key} —— 加载结果为空`);
                }
                this.dirIndex.set(decl.key, assets);
            } catch (e) {
                this.missingList.push(`[目录] ${decl.key} —— 加载异常：${e}`);
            }
            report(`目录 ${decl.key}`);
        }
        //#endregion

        //#region 2. 单资源加载（预制体 / 动画片段）—— 并发，加快启动
        await Promise.all(GAME_ASSETS.map(async (decl) => {
            const url = ResBridge.url(decl.key, decl.name);
            try {
                await resMgr.loadAsset(decl.key, decl.type, decl.name, decl.bundle);
                const raw = resMgr.getAssetsByKey(decl.key) || [];
                const hit = decl.name
                    ? raw.find((item) => item.name === decl.name)
                    : (raw.length === 1 ? raw[0] : null);
                if (!hit) {
                    this.missingList.push(`[资源] ${url} —— 未在缓存中找到`);
                } else {
                    const id = ResBridge.id(decl.key, decl.name);
                    this.assetIndex.set(id, hit.data);
                    if (decl.type === Prefab) {
                        this.prefabIndex.set(id, hit.data as Prefab);
                    }
                }
            } catch (e) {
                this.missingList.push(`[资源] ${url} —— 加载异常：${e}`);
            }
            report(`资源 ${url}`);
        }));
        //#endregion

        //#region 3. 完整性校验 —— 缺资源就在启动期炸，不留到运行期
        if (this.missingList.length > 0) {
            const lines = this.missingList.slice();
            this.missingList.length = 0;
            this.phase = BootPhase.Idle;
            throw new Error(
                `[ResBridge] 资源预加载失败，共 ${lines.length} 项缺失：\n` +
                lines.map((s, i) => `  ${i + 1}. ${s}`).join("\n") +
                `\n请检查 AssetManifest.ts 中的声明是否与实际资源路径一致。`
            );
        }
        //#endregion

        //#region 4. 节点池预热 —— 把运行期 instantiate 的开销提前到启动期
        for (let i = 0; i < GAME_ASSETS.length; i++) {
            const decl = GAME_ASSETS[i];
            if (!decl.prewarm || decl.type !== Prefab) continue;
            const id = ResBridge.id(decl.key, decl.name);
            const prefab = this.prefabIndex.get(id);
            if (!prefab) continue;
            const pool = this.getPool(id);
            for (let n = 0; n < decl.prewarm; n++) {
                const node = instantiate(prefab);
                node.active = false;
                pool.push(node);
            }
        }
        //#endregion

        //#region 5. 封盘 —— 关闭底层加载能力，把架构约束钉死
        resMgr.seal();
        this.phase = BootPhase.Sealed;
        console.log(
            `[ResBridge] 预加载完成，耗时 ${Date.now() - startTime}ms ｜ ` +
            `目录 ${this.dirIndex.size} 个 ｜ 资源 ${this.assetIndex.size} 个 ｜ 阶段 ${BootPhase[this.phase]}`
        );
        //#endregion
    }

    /**
     * @description 断言资源层已就绪
     * ECS 入口（World.init）会调用此方法，防止在资源未就绪时提前跑逻辑
     */
    public assertReady(reason: string): void {
        if (this.phase !== BootPhase.Sealed) {
            throw new Error(
                `[ResBridge] 资源层未就绪（当前阶段 = ${BootPhase[this.phase]}），` +
                `禁止执行「${reason}」。\n` +
                `ECS 运行期不允许异步加载，请先把资源加入 AssetManifest，` +
                `并在游戏入口 await resBridge.boot() 后再启动世界。`
            );
        }
    }
    //#endregion

    //#region 运行期 · 全部同步
    /**获取单个资源（Prefab / AnimationClip / 任意 Asset）*/
    public getAsset<T extends Asset>(key: string, name?: string): T {
        this.assertReady(`getAsset(${ResBridge.url(key, name)})`);
        const asset = this.assetIndex.get(ResBridge.id(key, name));
        if (!asset) {
            throw new Error(
                `[ResBridge] 资源未预加载：${ResBridge.url(key, name)}\n` +
                `请在 AssetManifest.ts 的 GAME_ASSETS 中补充该声明。`
            );
        }
        return asset as T;
    }

    /**获取预制体*/
    public getPrefab(key: string, name?: string): Prefab {
        this.assertReady(`getPrefab(${ResBridge.url(key, name)})`);
        const prefab = this.prefabIndex.get(ResBridge.id(key, name));
        if (!prefab) {
            throw new Error(
                `[ResBridge] 预制体未预加载：${ResBridge.url(key, name)}\n` +
                `请在 AssetManifest.ts 的 GAME_ASSETS 中补充该声明（type 需为 Prefab）。`
            );
        }
        return prefab;
    }

    /**获取序列帧数组（只读，调用方不要就地修改顺序）*/
    public getFrames(key: string): SpriteFrame[] {
        this.assertReady(`getFrames(${key})`);
        const frames = this.dirIndex.get(key);
        if (!frames) {
            throw new Error(
                `[ResBridge] 序列帧目录未预加载：${key}\n` +
                `请在 AssetManifest.ts 的 GAME_DIRS 中补充该声明。`
            );
        }
        return frames as SpriteFrame[];
    }

    /**获取动画片段*/
    public getClip(name: string): AnimationClip {
        return this.getAsset<AnimationClip>("", name);
    }

    /**
     * @description 取出一个节点（优先复用池中的实例）
     * 运行期高频调用点（子弹），池为空时才 instantiate
     */
    public spawn(key: string, name?: string): Node {
        this.assertReady(`spawn(${ResBridge.url(key, name)})`);
        const id = ResBridge.id(key, name);
        const pool = this.nodePools.get(id);
        if (pool && pool.length > 0) {
            const node = pool.pop();
            node.active = true;
            return node;
        }
        const prefab = this.getPrefab(key, name);
        return instantiate(prefab);
    }

    /**
     * @description 回收节点到池中
     * 注意：本方法只重置 active 与父子关系，不重置节点上的业务状态
     * （SpriteFrame / Color / Scale 等由各自 System 在复用时重新写入）
     */
    public recycle(key: string, name: string, node: Node): void {
        if (!node) return;
        const id = ResBridge.id(key, name);
        const pool = this.getPool(id);
        node.active = false;
        node.removeFromParent();
        pool.push(node);
    }
    //#endregion

    //#region 调试
    /**导出当前索引快照，方便在控制台排查资源问题*/
    public dump(): void {
        console.log(`[ResBridge] 阶段 = ${BootPhase[this.phase]}`);
        console.log("[ResBridge] 单资源：", Array.from(this.assetIndex.keys()));
        console.log("[ResBridge] 目录：", Array.from(this.dirIndex.entries()).map(([k, v]) => `${k} (${v.length} 帧)`));
        console.log("[ResBridge] 节点池：", Array.from(this.nodePools.entries()).map(([k, v]) => `${k} (${v.length} 个)`));
    }
    //#endregion

    //#region 内部工具
    /**拼接资源唯一标识*/
    private static id(key: string, name?: string): string {
        return name ? `${key}|${name}` : key;
    }
    /**拼接资源 url（key 为空时 url 即 name）*/
    private static url(key: string, name?: string): string {
        if (!name) return key;
        return key ? `${key}/${name}` : name;
    }
    /**取（或创建）节点池*/
    private getPool(id: string): Node[] {
        let pool = this.nodePools.get(id);
        if (!pool) {
            pool = [];
            this.nodePools.set(id, pool);
        }
        return pool;
    }
    /**按名称自然排序（idle (2) 排在 idle (10) 前面）*/
    private naturalSort(assets: Asset[]): Asset[] {
        return assets.slice().sort((a, b) =>
            String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: "base" })
        );
    }
    //#endregion
}

export const resBridge = ResBridge.instance;
