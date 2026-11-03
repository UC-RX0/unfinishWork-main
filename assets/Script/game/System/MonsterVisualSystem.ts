import { Color, Sprite } from "cc";
import { ISystem } from "../Base/ISystem";
import { EnemyComponent, PosComponent, ViewComponent } from "../Component";
import { MonsterStateComponent } from "../Component/MonsterStateComponent";
import { evalMonsterVisual, isClipDriven } from "../Config/MonsterState";
import { ComponentClass } from "../tool/ComponentManager";

/**复用对象，避免每帧 new 造成的 GC 抖动*/
const _tmpColor = new Color(255, 255, 255, 255);

/**
 * @description 怪物表现系统（优先级 202，渲染段）
 *
 * 这里体现了两条关键约束：
 * 1. 【位置叠加而非覆盖】node.position = 逻辑位置 + 表现偏移
 *    逻辑位置只由 MoveSystem 写，冲刺/抖动只是叠加上去的视觉量。
 *    旧做法里 Attack.anim 的 position 轨道会和 PosSyncSystem 抢写同一个属性，
 *    结果是怪物被"推走"再被拉回来，视觉上抽搐。
 *
 * 2. 【纯函数求值，无状态累积】每帧都从 (状态, 帧龄) 重算出完整的变换，
 *    不依赖上一帧的结果。所以回滚、跳帧、重置都不会留下脏数据。
 */
export class MonsterVisualSystem extends ISystem {
    requiredComponents: ComponentClass<any>[] = [MonsterStateComponent, ViewComponent, PosComponent];

    /**记录当前被染色的实体，避免每帧无谓地重设颜色*/
    private tinted: Set<number> = new Set();

    init(): void {
        this.enable = true;
    }

    update(dt: number): void {
        const frame = this.world.frame;
        const entities = this.world.query(...this.requiredComponents);

        for (let i = 0; i < entities.length; i++) {
            const id = entities[i];
            const st = this.world.getComp(id, MonsterStateComponent);
            const view = this.world.getComp(id, ViewComponent);
            const pos = this.world.getComp(id, PosComponent);
            const node = view.node;
            if (!node) continue;

            // 怪物类型缩放（快速怪更小、高血怪更大）
            const enemy = this.world.getComp(id, EnemyComponent);
            const typeScale = enemy ? enemy.scale : 1;

            // 帧龄：进入当前状态后经过了多少逻辑帧
            const t = frame - st.enterFrame;
            const out = evalMonsterVisual(st.state, t, st.seed, st.facing);

            // clip 接管的状态：位移与缩放由 clip 在子节点上负责，
            // 这里只把逻辑位置写到根节点，避免双重缩放/双重位移
            if (isClipDriven(st.state)) {
                node.setPosition(pos.pos.x, pos.pos.y, 0);
                // 缩放只保留朝向翻转与类型缩放，尺寸动画交给 clip
                node.setScale(st.facing * typeScale, typeScale, 1);
                node.angle = 0;
                this.applyTint(id, node, out.tint);
                continue;
            }

            // 逻辑位置 + 表现偏移（逻辑层是纯数据向量，这里转成引擎坐标）
            node.setPosition(pos.pos.x + out.offsetX, pos.pos.y + out.offsetY, 0);

            // 朝向决定水平翻转，缩放由表现求值给出
            const s = out.scale * typeScale;
            node.setScale(s * st.facing, s, 1);

            node.angle = out.angle;

            this.applyTint(id, node, out.tint);
        }
    }

    /**受击染色：只在需要时写 Sprite.color，恢复后立即写回原色*/
    private applyTint(id: number, node: any, tint: number): void {
        const sprite = node.getComponent(Sprite);
        if (!sprite) return;

        if (tint > 0) {
            _tmpColor.r = 255;
            _tmpColor.g = Math.round(255 - 180 * tint);
            _tmpColor.b = Math.round(255 - 180 * tint);
            _tmpColor.a = 255;
            sprite.color = _tmpColor;
            this.tinted.add(id);
        } else if (this.tinted.has(id)) {
            _tmpColor.r = 255;
            _tmpColor.g = 255;
            _tmpColor.b = 255;
            _tmpColor.a = 255;
            sprite.color = _tmpColor;
            this.tinted.delete(id);
        }
    }
}
