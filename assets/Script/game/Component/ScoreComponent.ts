import { IComponent } from "../Base/IComponent";

/**
 * @description 玩家战绩组件
 *
 * 挂在每个玩家实体上。联机时每个玩家各自计分，
 * 但分数属于【共享世界状态】—— 必须在所有客户端算出同样的值，
 * 所以这里只放整数，不放任何本地化的展示数据。
 */
export class ScoreComponent implements IComponent {
    /**累计得分*/
    score: number = 0;

    /**累计击杀数*/
    kills: number = 0;

    /**连续击杀数（连击），断连击会清零*/
    combo: number = 0;

    /**连击计时器（逻辑帧），归零则连击断*/
    comboTimer: number = 0;
}
