import { Vec2 } from "cc";
//黑板类 先写 不一定需要
class Board {
    private constructor() { }
    private static _instance: Board = null;
    public static get instance(): Board {
        if (this._instance == null) {
            this._instance = new Board();
        }
        return this._instance;
    }
    inputState = {
        speed: 50,
        //当外界输入时要提前一步进行normalize化处理
        direction: Vec2.ZERO
    }
}

export const Blackboard = Board.instance;
