import { AnimationClip, Asset, Prefab, SpriteFrame } from "cc";
import { ClipEnum, PathEnum, UIEnum } from "./ResEnum";

/**
 * 资源构造函数类型（Prefab / SpriteFrame / AnimationClip ...）
 * 必须用 typeof Asset 而非 new(...)=>T：
 * resources.load 的类型参数要求带有 deserialize 等静态成员，纯构造签名不满足。
 */
export type AssetCtor = typeof Asset;

/**
 * @description 单个资源声明
 * 对应 resources.load(url) 的一次调用，其中 url = key + "/" + name
 * key 为空串时 url 即为 name（用于 resources 根目录下的文件）
 */
export interface IAssetDecl {
    /**资源所在目录（resources 下的相对路径）*/
    key: string;
    /**资源文件名（不含扩展名）*/
    name?: string;
    /**资源类型，决定 load 时的类型过滤*/
    type: AssetCtor;
    /**分包名，不填则走内置 resources*/
    bundle?: string;
    /**预热数量：启动时预先 instantiate 多少个节点放入池中（仅 Prefab 有效）*/
    prewarm?: number;
}

/**
 * @description 目录声明
 * 对应 resources.loadDir(url) 的一次调用，用于批量加载序列帧
 */
export interface IDirDecl {
    /**目录路径*/
    key: string;
    /**目录内资源类型*/
    type?: AssetCtor;
    /**
     * 是否按名称自然排序，默认 true。
     * loadDir 的返回顺序不保证稳定，序列帧必须排序才能保证动画播放顺序一致。
     */
    sort?: boolean;
}

/**
 * @description 游戏资源总清单
 * 这里是 "游戏需要哪些资源" 的唯一事实来源。
 * 任何新增资源都必须先在此声明，否则 ResBridge 在运行期会直接抛错。
 */
export interface IBootManifest {
    assets: IAssetDecl[];
    dirs: IDirDecl[];
}

//#region 目录清单（序列帧）
export const GAME_DIRS: IDirDecl[] = [
    //角色
    { key: PathEnum.ActorIdle, type: SpriteFrame },
    { key: PathEnum.ActorRun, type: SpriteFrame },
    //武器
    { key: PathEnum.Bullet1Idle, type: SpriteFrame },
    { key: PathEnum.Bullet1Attack, type: SpriteFrame },
    //子弹飞行 + 爆炸
    { key: PathEnum.BulletFly, type: SpriteFrame },
    { key: PathEnum.Explosion, type: SpriteFrame },
];
//#endregion

//#region 单资源清单（预制体 + 动画片段）
export const GAME_ASSETS: IAssetDecl[] = [
    //预制体：prewarm 为启动时的预热节点数量
    { key: PathEnum.Actor, name: UIEnum.Actor, type: Prefab, prewarm: 1 },
    { key: PathEnum.Weapon, name: UIEnum.Weapon1, type: Prefab, prewarm: 1 },
    //子弹高频生成，预热 32 个覆盖约 3~5 秒连续射击，避免首次射击卡顿
    { key: PathEnum.Bullet1, name: UIEnum.Bullet2, type: Prefab, prewarm: 32 },
    { key: PathEnum.Enemy, name: UIEnum.Enemy, type: Prefab },

    //动画片段：目前怪物逻辑仍走空序列帧配置，此处先纳入预加载清单，
    //待 AnimPlaySystem 支持把 clip 注入 Animation.clips 后即可直接切换使用
    { key: "", name: ClipEnum.EnemyIdle, type: AnimationClip },
    { key: "", name: ClipEnum.EnemyAttack, type: AnimationClip },
    { key: "", name: ClipEnum.EnemyDead, type: AnimationClip },
];
//#endregion

/**完整清单*/
export const GAME_MANIFEST: IBootManifest = {
    assets: GAME_ASSETS,
    dirs: GAME_DIRS,
};
