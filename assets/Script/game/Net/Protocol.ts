/**
 * @description 帧同步通信协议
 *
 * 设计原则：客户端与服务端之间只传【输入】，绝不传位置/血量等状态。
 * 一旦开始传状态，就退回成状态同步了。
 *
 * 所有数值字段都是整数，避免 JSON 浮点表示差异导致两端解析出不同的值。
 */

/**方向/速度定点精度，与 game/Input/FrameInput.ts 保持一致*/
export const NET_INPUT_SCALE = 1000;

//#region 客户端 → 服务端
export interface InputMsg {
    t: 'input';
    dirX: number;
    dirY: number;
    speed: number;
    fire: boolean;
}

export interface ChecksumMsg {
    t: 'checksum';
    frame: number;
    sum: string;
}
//#endregion

//#region 服务端 → 客户端
export interface WelcomeMsg {
    t: 'welcome';
    /**服务端分配的玩家索引，本端就是"我"*/
    playerIndex: number;
    /**全局随机种子，必须用它初始化 logicRng，否则刷怪序列会分叉*/
    seed: number;
    playerCount: number;
    frame: number;
    logicFps: number;
}

export interface FramePayload {
    frame: number;
    playerIndex: number;
    dirX: number;
    dirY: number;
    speed: number;
    fire: boolean;
}

export interface FrameMsg {
    t: 'frame';
    frame: number;
    /**该帧所有玩家的输入，顺序与 roster 一致*/
    inputs: FramePayload[];
}

export interface RosterMsg {
    t: 'roster';
    players: number[];
}

export interface DesyncMsg {
    t: 'desync';
    frame: number;
    detail: [number, string][];
}

export interface FullMsg {
    t: 'full';
    maxPlayers: number;
}
//#endregion

export type ServerMsg = WelcomeMsg | FrameMsg | RosterMsg | DesyncMsg | FullMsg;
