//#region 逻辑段（按优先级排列，这里列出的顺序就是建议的执行顺序）
export { InputSystem } from './InputSystem';
export { WaveSystem } from './WaveSystem';
export { EnemySpawnSystem } from './EnemySpawnSystem';
export { WeaponAimSystem } from './WeaponAimSystem';
export { WeaponSystem } from './WeaponSystem';
export { AISystem } from './AISysten';
export { MoveSystem } from './MoveSystem';
export { BulletSystem } from './BulletSystem';
export { DamageSystem } from './DamageSystem';
export { MonsterStateSystem } from './MonsterStateSystem';
export { ScoreSystem } from './ScoreSystem';
export { DeathSystem } from './DeathSystem';
export { AnimTickSystem } from './AnimTickSystem';
//#endregion

//#region 渲染段（只读逻辑数据，不回写）
export { PosSyncSystem as PosSynSystem } from './PosSyncSystem';
export { FaceDirectionSystem } from './FaceDirectionSystem';
export { MonsterVisualSystem } from './MonsterVisualSystem';
export { MonsterClipSystem } from './MonsterClipSystem';
export { BulletDirSystem } from './BulletDirSystem';
export { WeaponViewSystem } from './WeaponViewSystem';
export { AnimRenderSystem } from './AnimRenderSystem';
//#endregion

//#region 调试与校验
export { ChecksumSystem } from './ChecksumSystem';
export { SnapshotTestSystem } from './SnapshotTestSystem';
export { ScriptedInputSystem } from './ScriptedInputSystem';
export { MonsterStateProbeSystem } from './MonsterStateProbeSystem';
//#endregion
