import { _decorator, Component, Node, Vec3 } from "cc";
import { BATTLE_CONFIG } from "../game/Config/BattleConfig";

const { ccclass, property } = _decorator;

/**
 * @description 摄像机跟随（渲染层组件）
 *
 * 摄像机跟着玩家走，并限制在战场范围内 —— 跟丢了玩家就等于让玩家看不见自己。
 *
 * 用缓动而不是硬跟随：硬跟随会有"像素跳动"，缓动看起来更顺。
 * 缓动系数与帧率无关（用 deltaTime 换算），所以 30 帧和 120 帧下手感一致。
 */
@ccclass('CameraFollow')
export class CameraFollow extends Component {
    /**跟随目标（玩家节点）*/
    @property(Node)
    target: Node = null;

    /**跟随速度（每秒追近的比例，越大越紧）*/
    @property
    followSpeed: number = 8;

    /**是否限制在战场范围内*/
    @property
    limitToField: boolean = true;

    private tmp: Vec3 = new Vec3();

    update(dt: number) {
        if (!this.target || !this.target.isValid) return;

        const tx = this.target.position.x;
        const ty = this.target.position.y;

        let dx = tx - this.node.position.x;
        let dy = ty - this.node.position.y;

        if (this.limitToField) {
            // 摄像机位置要保证视野完全落在战场内。
            // 屏幕可见区域是视口大小（这里按 1280x720 的设计分辨率算），
            // 战场半宽 800 半高 450 → 摄像机 x 限制在 ±(800-640)=±160。
            const halfViewW = 640;
            const halfViewH = 360;
            const maxX = Math.max(0, BATTLE_CONFIG.fieldHalfWidth - halfViewW);
            const maxY = Math.max(0, BATTLE_CONFIG.fieldHalfHeight - halfViewH);

            const desiredX = Math.max(-maxX, Math.min(maxX, this.node.position.x + dx));
            const desiredY = Math.max(-maxY, Math.min(maxY, this.node.position.y + dy));
            dx = desiredX - this.node.position.x;
            dy = desiredY - this.node.position.y;
        }

        // 指数缓动：与帧率无关
        const k = 1 - Math.exp(-this.followSpeed * dt);
        this.tmp.set(this.node.position.x + dx * k, this.node.position.y + dy * k, this.node.position.z);
        this.node.setPosition(this.tmp);
    }
}
