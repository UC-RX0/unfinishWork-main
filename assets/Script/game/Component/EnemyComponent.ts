import { IComponent } from "../Base/IComponent";


/**
 * @description 怪物属性组件
 */
export class EnemyComponent implements IComponent {
    /**击杀获得的分数（生成时按波次倍率算好）*/
    score: number = 0;
    /**出场时的波次*/
    wave: number = 0;
    /**攻击范围（像素），注意比较时用其平方*/
    attackRange: number = 80;
    /**
     * 怪物类型（EnemyType）。
     * 类型决定血量/速度/体型/基础分，生成时按"波次倍率 × 类型倍率"算好。
     */
    type: number = 0;
    /**外观缩放倍率（1 = 原尺寸），由类型决定*/
    scale: number = 1;

}
