import { v3, Vec3 } from "cc";
import { IComponent } from "../Base/IComponent";

export class PosComponent implements IComponent {
    /**归属ID*/
    public id: number = 0;
    /**位置*/
    public pos: Vec3 = v3(0, 0, 0);
}