import { SpriteFrame } from "cc";
import { IComponent } from "../Base/IComponent";
import { AnimConfig } from "../Config/AnimConfig";

export enum IState {
    /**待机*/
    Idle = "Idle",
    /**移动*/
    Walk = "Walk",
    /**攻击*/
    Attack = "Attack",
    /**受到攻击*/
    GetAttack = "GetAttack",
    /**爆炸*/
    Explode = "Explode",
    /**子弹飞行状态*/
    fly = "fly",
}

export class AnimComponent implements IComponent {
    /**当前状态*/
    state: string = IState.Idle;
    configs: Map<string, AnimConfig> = new Map();
    nextState: string | null = null;
    frameIndex: number = 0;
    timer: number = 0;
    /**是否播放完成*/
    isComplete: boolean = false; //非循环动画播完  决定是否需要携带cb函数
    currentTrigger: string = "";//当前触发的事件
}