import { ChecksumMsg, FrameMsg, InputMsg, ServerMsg, StartMsg, WelcomeMsg } from "./Protocol";

/**
 * @description WebSocket 客户端封装
 *
 * 只负责收发与消息分发，不含任何游戏逻辑。
 * 用全局 WebSocket：浏览器和 Cocos 原生都内置，不需要额外依赖。
 */
export class NetClient {
    private ws: WebSocket = null;

    /**收到 welcome 后拿到的服务端分配信息*/
    public welcome: WelcomeMsg = null;
    /**房间成型后的开局通知（房间人数已确定，可以开始建世界了）*/
    public startMsg: StartMsg = null;

    /**开局通知回调：房间人数已定，可以建世界了*/
    public onStart: (msg: StartMsg) => void = null;
    public onFrame: (msg: FrameMsg) => void = null;
    public onRoster: (players: number[]) => void = null;
    public onDesync: (msg: any) => void = null;
    public onClose: () => void = null;

    /**建立连接并等待 welcome；超时直接抛错，避免游戏卡在启动期*/
    public connect(url: string, timeoutMs: number = 5000): Promise<WelcomeMsg> {
        return new Promise<WelcomeMsg>((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error(`[NetClient] 连接 ${url} 超时`));
            }, timeoutMs);

            try {
                this.ws = new WebSocket(url);
            } catch (e) {
                clearTimeout(timer);
                reject(e);
                return;
            }

            this.ws.onopen = () => {
                console.log(`[NetClient] 已连接 ${url}`);
            };

            this.ws.onmessage = (ev: MessageEvent) => {
                let msg: ServerMsg;
                try {
                    msg = JSON.parse(ev.data as string);
                } catch (e) {
                    return;
                }

                if (msg.t === 'welcome') {
                    this.welcome = msg;
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        resolve(msg);
                    }
                    return;
                }
                if (msg.t === 'start') {
                    this.startMsg = msg;
                    if (this.onStart) this.onStart(msg);
                    return;
                }
                if (msg.t === 'frame') {
                    if (this.onFrame) this.onFrame(msg);
                    return;
                }
                if (msg.t === 'roster') {
                    if (this.onRoster) this.onRoster(msg.players);
                    return;
                }
                if (msg.t === 'desync') {
                    console.error(`[NetClient] 检测到分叉 frame=${msg.frame}`, msg.detail);
                    if (this.onDesync) this.onDesync(msg);
                    return;
                }
                if (msg.t === 'full') {
                    console.error(`[NetClient] 房间已满（上限 ${msg.maxPlayers}）`);
                    return;
                }
            };

            this.ws.onerror = () => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                reject(new Error(`[NetClient] 连接 ${url} 失败`));
            };

            this.ws.onclose = () => {
                console.log('[NetClient] 连接已关闭');
                if (this.onClose) this.onClose();
            };
        });
    }

    public get connected(): boolean {
        return !!this.ws && this.ws.readyState === 1;
    }

    /**上报当前输入状态（服务端会把它盖章到当前帧）*/
    public sendInput(dirX: number, dirY: number, speed: number, fire: boolean): void {
        if (!this.connected) return;
        const msg: InputMsg = { t: 'input', dirX, dirY, speed, fire };
        this.ws.send(JSON.stringify(msg));
    }

    /**上报本帧校验和，服务端负责跨客户端比对*/
    public sendChecksum(frame: number, sum: string): void {
        if (!this.connected) return;
        const msg: ChecksumMsg = { t: 'checksum', frame, sum };
        this.ws.send(JSON.stringify(msg));
    }

    public close(): void {
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) { /* 忽略重复关闭 */ }
            this.ws = null;
        }
    }
}
