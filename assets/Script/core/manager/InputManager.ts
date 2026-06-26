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
    public setInput(id: number, direction: Vec2, speed: number) {
        this.inputMap.set(id, { direction, speed });
    }
    public getInput(playerIndex: number) {
        return this.inputMap.get(playerIndex);
    }
    public removeInput(id: number) {
        this.inputMap.delete(id);
    }
}

export const inputMgr = InputManager.instance;
