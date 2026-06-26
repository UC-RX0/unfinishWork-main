
import { _decorator, Component, Event, EventTouch, Input, input, Node, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoyStickManager')
export class JoyStickManager extends Component {
    @property(Node)
    background: Node = null;
    @property(Node)
    Point: Node = null;
    @property(Node)
    shoot: Node = null;
    //是否是固定摇杆 后期可以根据设置动态调整
    private isFix = false;
    private defaultPos: Vec3 = null;
    private maxRadius: number = 0;
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.defaultPos = this.background.position;
        this.maxRadius = this.background.getComponent(UITransform).width / 2;
    }

    //在onTouchStart中获取触碰点的坐标
    private onTouchStart(event: EventTouch) {
        //如果是固定摇杆 则整体不移动
        if (this.isFix) return;
        let realPos = this.getRealPos(event);
        this.background.setPosition(realPos);
        // this.background.setPosition(event.getLocationX(), event.getLocationY());
    }
    //在onTouchMove中根据触碰点的坐标计算出移动方向
    private onTouchMove(event: EventTouch) {
        //根据触碰点的坐标计算出移动方向
        let realPos = this.getRealPos(event);
        let offset = realPos.subtract(this.background.position);
        if (offset.length() > this.maxRadius) {
            offset.normalize();
            offset.multiplyScalar(this.maxRadius);
        }
        this.Point.setPosition(offset);



    }
    //在onTouchEnd中重置移动方向
    private onTouchEnd(event: EventTouch) { }


    private getRealPos(event: EventTouch) {
        let pos = event.getUILocation();
        let realPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(pos.x, pos.y, 0));
        return realPos;
    }



}
