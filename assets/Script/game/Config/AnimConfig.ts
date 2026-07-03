import { AnimationClip, SpriteFrame } from "cc";

export interface AnimConfig {
    type?: 'sequence' | 'animation';

    // sequence 类型
    frames?: SpriteFrame[];
    interval?: number;

    // animation 类型（.anim 文件）
    clip?: AnimationClip;

    // 通用
    loop: boolean;
    events?: Record<number, string>;
}