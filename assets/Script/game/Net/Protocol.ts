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
    /**
     * 这个输入属于哪一逻辑帧。
     *
     * 【为什么必须带帧号】
     *   客户端预测时，本地输入"立即生效"，但服务端盖章是异步的。
     *   如果不带帧号，服务端只能按"上报时刻"盖章，
     *   客户端就永远不知道自己的输入被算到了哪一帧上，
     *   预测也就无从比对。
     *
     *   带上帧号后：客户端采样第 N 帧的输入 → 报"N 帧的输入" →
     *   服务端在第 N 帧盖章回传 → 两端逐位相同，本地输入永不回滚。
     */
    frame: number;
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

/**
 * 开局通知
 * 房间人数凑齐后服务端下发这一条，客户端【必须等它到了才开始建世界】——
 * 否则先到的客户端不知道后到的人存在，两端实体集合不同，必然分叉。
 */
export interface StartMsg {
    t: 'start';
    /**最终房间人数，客户端据此创建对应数量的玩家实体*/
    playerCount: number;
    /**随机种子*/
    seed: number;
    /**起始帧号*/
    frame: number;
    logicFps: number;
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

export type ServerMsg = WelcomeMsg | StartMsg | FrameMsg | RosterMsg | DesyncMsg | FullMsg;
