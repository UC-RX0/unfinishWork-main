import { SpriteFrame } from "cc";
import { IComponent } from "../Base/IComponent";

export enum IState {
    /**待机*/
    Idle = 1,
    /**移动*/
    Walk,
    /**攻击*/
    Attack,
    /**受到攻击*/
    GetAttack,
    /**爆炸*/
    Explode,
}

export class AnimComponent implements IComponent {
    /**当前状态*/
    state: IState = IState.Idle;
    frameDatas: Map<IState, SpriteFrame[]> = new Map();
    frameIndex: number = 0;
    timer: number = 0;
    frameInterval: number = 1 / 60; //每帧时间间隔 0.0167s
    /**是否循环播放*/
    loop: boolean = false;
    /**是否播放完成*/
    isComplete: boolean = false; //非循环动画播完  决定是否需要携带cb函数
}