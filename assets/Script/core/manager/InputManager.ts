import { Vec2 } from "cc";

class InputManager {
    private constructor() { }
    private static _instance: InputManager = null;
    public static get instance(): InputManager {
        if (this._instance == null) {
            this._instance = new InputManager();
        }
        return this._instance;
    }

    private inputMap: Map<number, { direction: Vec2, speed: number }> = new Map();
    private fireHeld: Map<number, boolean> = new Map();
    private fireRequested: Map<number, boolean> = new Map();

    //#region 方向盘输入
    public setInput(id: number, direction: Vec2, speed: number) {
        this.inputMap.set(id, { direction, speed });
    }
    public getInput(playerIndex: number) {
        return this.inputMap.get(playerIndex) || undefined;
    }
    public removeInput(id: number) {
        this.inputMap.delete(id);
    }
    //#endregion

    //#region 射击输入
    /**按下射击按钮 */
    public fireDown(index: number) {
        this.fireHeld.set(index, true);
        this.fireRequested.set(index, true);
    }
    /**松开射击按钮 */
    public fireUp(index: number) {
        this.fireHeld.set(index, false);
    }
    /**是否应该开火（消费一次请求） */
    public wantsToFire(index: number): boolean {
        const held = this.fireHeld.get(index) || false;
        const requested = this.fireRequested.get(index) || false;
        this.fireRequested.set(index, false);
        return held || requested;
    }
    //#endregion
}

export const inputMgr = InputManager.instance;
