import { _decorator, Component, Node, Vec3 } from "cc";
import { BATTLE_CONFIG } from "../game/Config/BattleConfig";
import { CameraFollow } from "./CameraFollow";

const { ccclass } = _decorator;

/**
 * @description 表现层装配（渲染层组件）
 *
 * 负责把"场景里静态摆好的东西"和"ECS 动态生成的东西"接起来：
 *   - 地图：从场景的 Stage/Map 挪到相机可见范围，并让它跟着相机平移
 *   - 相机：挂上 CameraFollow，锁定跟随玩家
 *
 * 为什么地图要跟着相机平移：
 *   战场比屏幕大（1600x900 vs 1280x720），相机移动时如果地图不动，
 *   玩家会走到"地图外面"的空白区域。
 *
 * 为什么用代码装配而不是改场景文件：
 *   场景文件是二进制序列化的 JSON，手改容易出错；
 *   而"节点在运行时被创建/移动"这件事本来就属于表现层，放在代码里更好读。
 */
@ccclass('PresentationRig')
export class PresentationRig extends Component {
    /**被跟随的玩家节点（由 GameLaunch 注入）*/
    public followTarget: Node = null;

    /**地图节点（自动查找）*/
    private mapNode: Node = null;
    /**相机节点（自动查找）*/
    private cameraNode: Node = null;
    /**地图初始位置，用于计算跟随偏移*/
    private mapOrigin: Vec3 = new Vec3();
    private tmp: Vec3 = new Vec3();

    start() {
        this.cameraNode = this.findNode("Camera");
        this.mapNode = this.findNode("Map");

        if (this.cameraNode) {
            const follow = this.cameraNode.getComponent(CameraFollow);
            if (!follow) this.cameraNode.addComponent(CameraFollow);
        }

        if (this.mapNode) {
            this.mapOrigin.set(this.mapNode.position.x, this.mapNode.position.y, this.mapNode.position.z);
        }
    }

    update(dt: number) {
        if (!this.cameraNode || !this.mapNode) return;

        // 地图跟随相机平移：地图与相机保持相对静止
        // 地图本身的初始位置要保留（它在场景里被摆在 Stage 下）
        this.tmp.set(
            this.mapOrigin.x + this.cameraNode.position.x,
            this.mapOrigin.y + this.cameraNode.position.y,
            this.mapOrigin.z
        );
        this.mapNode.setPosition(this.tmp);
    }

    /**把跟随目标交给 CameraFollow*/
    public setFollowTarget(target: Node): void {
        this.followTarget = target;
        if (this.cameraNode) {
            const follow = this.cameraNode.getComponent(CameraFollow);
            if (follow) follow.target = target;
        }
    }

    /**在场景树里按名字找节点（广度优先，跳过自己）*/
    private findNode(name: string): Node {
        const root = this.node.scene;
        if (!root) return null;
        const queue: Node[] = [root];
        while (queue.length > 0) {
            const cur = queue.shift();
            for (let i = 0; i < cur.children.length; i++) {
                const child = cur.children[i];
                if (child.name === name) return child;
                queue.push(child);
            }
        }
        return null;
    }
}
