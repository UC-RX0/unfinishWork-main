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
    private shootMap: Map<number, boolean> = new Map();
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
    public setShoot(id: number, shoot: boolean) {
        this.shootMap.set(id, shoot);
    }
    public getShoot(playerIndex: number) {
        return this.shootMap.get(playerIndex) || false;
    }
    //#endregion
}
export const inputMgr = InputManager.instance;
