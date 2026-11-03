import { IComponent } from "../Base/IComponent";
import { createVec2, Vec2Like } from "../Math/MathUtil";

export class VelocityComponent implements IComponent {
    /**速度标量（像素/秒）*/
    public speed: number = 0;
    /**速度方向（单位向量，逻辑层纯数据）*/
    public direction: Vec2Like = createVec2(0, 0);
}
