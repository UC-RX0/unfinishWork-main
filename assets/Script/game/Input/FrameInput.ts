/**
 * @description 单帧单玩家的输入
 *
 * 帧同步里客户端之间只传这个东西，不传位置/血量。
 * 所以它必须满足：
 *   1. 可序列化、体积小（每帧每人十几个字节）
 *   2. 方向用【定点整数】而不是浮点
 *      —— 0.7071 这种值经 JSON 往返在不同端可能得到不同的浮点表示，
 *         而 707 永远是 707。这是帧同步里最容易被忽略的分叉源。
 *   3. 只表达"意图"（往哪走、要不要开火），不表达"结果"
 */
export interface FrameInput {
    /**所属逻辑帧号*/
    frame: number;
    /**玩家索引*/
    playerIndex: number;
    /**方向 X，定点整数 -1000 ~ 1000*/
    dirX: number;
    /**方向 Y，定点整数 -1000 ~ 1000*/
    dirY: number;
    /**速度强度 0 ~ 1000，实际速度 = speed / 1000 * playerSpeed*/
    speed: number;
    /**本帧是否开火*/
    fire: boolean;
}

/**方向/速度的定点精度*/
export const INPUT_SCALE = 1000;

/**空输入，用于玩家掉线时补位，保证帧不卡*/
export function emptyInput(frame: number, playerIndex: number): FrameInput {
    return { frame, playerIndex, dirX: 0, dirY: 0, speed: 0, fire: false };
}

/**
 * @description 输入帧缓冲
 *
 * 锁步的核心数据结构：按帧号索引，等待所有玩家的输入到齐才能执行该帧。
 * 本地单机模式下"到齐"永远成立，接网络后由 ready() 决定是否卡住等待。
 */
export class FrameInputBuffer {
    private frames: Map<number, Map<number, FrameInput>> = new Map();

    public push(input: FrameInput): void {
        let byPlayer = this.frames.get(input.frame);
        if (!byPlayer) {
            byPlayer = new Map();
            this.frames.set(input.frame, byPlayer);
        }
        byPlayer.set(input.playerIndex, input);
    }

    /**取某帧某玩家的输入，没有则返回 null*/
    public get(frame: number, playerIndex: number): FrameInput | null {
        const byPlayer = this.frames.get(frame);
        if (!byPlayer) return null;
        return byPlayer.get(playerIndex) || null;
    }

    /**该帧是否已收齐所有玩家*/
    public ready(frame: number, playerCount: number): boolean {
        const byPlayer = this.frames.get(frame);
        return !!byPlayer && byPlayer.size >= playerCount;
    }

    /**
     * 丢弃过旧的帧。
     * 保留一段窗口是为了将来做回滚（Rollback）时能重新取到历史输入。
     */
    public pruneBefore(frame: number, keepFrames: number = 300): void {
        const limit = frame - keepFrames;
        const stale: number[] = [];
        this.frames.forEach((_, key) => {
            if (key < limit) stale.push(key);
        });
        for (let i = 0; i < stale.length; i++) {
            this.frames.delete(stale[i]);
        }
    }

    public clear(): void {
        this.frames.clear();
    }
}

/**
 * @description 输入来源
 * 本地单机用 LocalInputSource，接网络后换成 NetworkInputSource，
 * World 和 System 完全不用改。
 */
export interface IFrameInputSource {
    /**为第 frame 帧准备输入（本地采样 / 从网络包解出）*/
    produce(frame: number, playerCount: number): void;
    /**是否具备执行该帧的条件（锁步下要等所有玩家的包）*/
    ready(frame: number, playerCount: number): boolean;
    /**清理不再需要的历史输入*/
    prune(frame: number): void;
}
