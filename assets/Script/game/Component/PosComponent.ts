import { IComponent } from "../Base/IComponent";
import { createVec2, Vec2Like } from "../Math/MathUtil";

export class PosComponent implements IComponent {
    /**位置（逻辑层纯数据，不依赖引擎向量）*/
    public pos: Vec2Like = createVec2(0, 0);
}
