
import { _decorator, Component, EventTouch, Input, input, Node, UITransform, v3, Vec2, Vec3 } from 'cc';
import { inputMgr } from '../core/manager/InputManager';

const { ccclass, property } = _decorator;

@ccclass('JoyStickManager')
export class JoyStickManager extends Component {
    @property(Node)
    background: Node = null;
    @property(Node)
    Point: Node = null;
    @property(Node)
    shoot: Node = null;

    private isFix = false;
    private defaultBgPos: Vec3 = null;
    private maxRadius: number = 0;
    //当前只有一个玩家 后期拓展为多个玩家的时候可以 在进入房间后根据玩家索引设置不同的输入索引
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.defaultBgPos = this.background.position.clone();
        this.maxRadius = this.background.getComponent(UITransform).width / 2;
    }

    private onTouchStart(event: EventTouch) {
        if (this.isFix) return;

        const touchPos = this.screenToLocal(event);
        this.background.setPosition(touchPos);
    }

    private onTouchMove(event: EventTouch) {
        const touchPos = this.screenToLocal(event);
        const bgPos = this.background.position;
        const delta = touchPos.subtract(bgPos);
        const len = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

        // 方向（单位向量）
        const dir = len > 0.001
            ? new Vec2(delta.x / len, delta.y / len)
            : new Vec2(0, 0);

        // 限制 Point 在半径内
        const clampedLen = Math.min(len, this.maxRadius);
        this.Point.setPosition(dir.x * clampedLen, dir.y * clampedLen, 0);

        // 写入 InputManager（玩家0，固定速度100）
        const strength = Math.min(len / this.maxRadius, 1);
        console.log("数据注入成功:", dir, strength * 100);
        inputMgr.setInput(0, dir, strength * 100);
    }

    private onTouchEnd(event: EventTouch) {
        this.Point.setPosition(0, 0, 0);

        if (!this.isFix) {
            this.background.setPosition(this.defaultBgPos);
        }

        inputMgr.setInput(0, Vec2.ZERO, 0);
    }

    // 触摸点屏幕坐标 → JoyStick 本地坐标
    private screenToLocal(event: EventTouch): Vec3 {
        const uiPos = event.getUILocation();
        return this.node.getComponent(UITransform)
            .convertToNodeSpaceAR(v3(uiPos.x, uiPos.y, 0));
    }
}
