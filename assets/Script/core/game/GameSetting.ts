import { _decorator, Component, Node } from 'cc';

/**
 * @description 作为游戏的配置类 做一些全局的配置 
 * 以便控制游戏的全局行为
*/
class GameSetting {
    private constructor() { }
    private static _instance: GameSetting = null;
    public static get instance(): GameSetting {
        if (this._instance == null) {
            this._instance = new GameSetting();
        }
        return this._instance;
    }
    /**是否远程加载资源 0：本地加载1：远程加载*/
    isRemote: number = 0;



}
export const gameParam = GameSetting.instance;


