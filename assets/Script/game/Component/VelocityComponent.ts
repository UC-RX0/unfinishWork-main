
import { v2, Vec2 } from "cc";
import { IComponent } from "../Base/IComponent";
export class VelocityComponent implements IComponent {
    /**速度*/
    public speed: number = 0;
    /**速度方向*/
    public direction: Vec2 = v2(0, 0);

}
