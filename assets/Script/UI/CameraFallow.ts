import { _decorator, Component, Node } from "cc";

const { ccclass, property } = _decorator;


@ccclass("CameraFallow")
export class CameraFallow extends Component {
    @property(Node)
    target: Node = null;





    //采用缓动算法
    smooth: boolean = true;


    //对于场景要采用无限播放措施

}