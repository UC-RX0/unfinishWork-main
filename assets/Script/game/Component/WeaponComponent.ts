import { IComponent } from "../Base/IComponent";
import { createVec2, Vec2Like } from "../Math/MathUtil";

export class WeaponComponent implements IComponent {
    /**子弹速度*/
    bulletSpeed: number = 300;
    /**武器朝向方向（360°单位向量），由 WeaponSyncSystem 每帧更新*/
    aimDirection: Vec2Like = createVec2(1, 0);
}
