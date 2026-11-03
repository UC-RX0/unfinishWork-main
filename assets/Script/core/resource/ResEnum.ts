/**
 * @description 资源路径枚举
 * 从 UIManager 中剥离出来独立成文件。
 * 原因：资源清单(AssetManifest)与过渡层(ResBridge)都需要这些枚举，
 * 而 UIManager 又依赖 ResBridge，若枚举留在 UIManager 中会产生循环引用。
 *
 * 约定：PathEnum 表示 "resources 下的目录路径"，UIEnum 表示 "该目录下的资源文件名"。
 * 两者组合 (key, name) 唯一定位一个资源。
 */
export enum PathEnum {
    /**角色预制体所在目录*/
    Actor = "Prefab/Actor",
    /**角色待机序列帧目录*/
    ActorIdle = "texture/actor/idle",
    /**角色奔跑序列帧目录*/
    ActorRun = "texture/actor/run",
    /**子弹预制体所在目录*/
    Bullet1 = "Prefab/Bullet",
    /**武器待机序列帧目录*/
    Bullet1Idle = "texture/weapon/weapon1/idle",
    /**武器攻击序列帧目录*/
    Bullet1Attack = "texture/weapon/weapon1/attack",
    /**武器预制体所在目录*/
    Weapon = "Prefab/Weapon",
    /**怪物预制体所在目录*/
    Enemy = "Prefab/Monster",
    /**爆炸序列帧目录*/
    Explosion = "texture/explosion",
    /**子弹飞行序列帧目录*/
    BulletFly = "texture/bullet/bullet2",
    /**地图预制体所在目录*/
    Map = "Prefab/Map",
    /**摇杆预制体所在目录*/
    JoyStick = "Prefab/UI",
}

/**
 * @description 资源名称枚举
 * 与 PathEnum 配对使用，作为目录内文件的名称
 */
export enum UIEnum {
    /**角色预制体*/
    Actor = "Actor",
    /**子弹预制体*/
    Bullet2 = "Bullet2",
    /**武器预制体*/
    Weapon1 = "Weapon1",
    /**怪物预制体（文件名是 Monster，不是 Enemy）*/
    Enemy = "Monster",
    /**地图预制体*/
    Map = "Map",
    /**摇杆预制体*/
    JoyStick = "JoyStick",
}

/**
 * @description 动画片段名称
 * 对应 resources 根目录下的 .anim 文件，key 为空串时 url 即为文件名本身
 */
export enum ClipEnum {
    /**怪物待机*/
    EnemyIdle = "idle",
    /**怪物攻击*/
    EnemyAttack = "Attack",
    /**怪物死亡（文件名是 Heart）*/
    EnemyDead = "Heart",
}
