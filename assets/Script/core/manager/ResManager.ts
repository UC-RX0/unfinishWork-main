import { Asset, assetManager, AssetManager, resources } from "cc";

interface IRes {
    name: string;
    type: typeof Asset;
    data: Asset;
}
class ResManager {
    private constructor() { }
    private static _instance: ResManager = null;
    public static get instance(): ResManager {
        if (this._instance == null) {
            this._instance = new ResManager();
        }
        return this._instance;
    }

    /**
     * 缓存资源
     * Key: 资源路径
     * Value: 资源列表
     * url= key+/name 可以得到单个资源的路径
     */
    private resMap: Map<string, IRes[]> = new Map();
    /**
     * 已经加载到场景的资源
     * Key: 资源路径
     * Value: 资源列表
     * 这里应该支持根据名称来查找是否已经加载过该资源 如果已经加载过 则直接返回该资源
    */
    private loadedResMap: Map<string, IRes[]> = new Map();
    // private bundleArr: string[] = [];

    //#region获取分包
    public getBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            if (assetManager.bundles.has(bundleName)) {
                resolve(assetManager.getBundle(bundleName));
                return;
            }
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(bundle);
            });
        })
    }
    //#endregion获取分包
    //#region 资源加载
    // 从分包中加载资源 如果有包则从包加载，没有包默认从Resource加载
    /**
     * @description 单个资源加载,写了不一定有用 只作为预备方法
     * @param url 资源路径
     * @param type 资源类型
     * @param name 资源名称 必须给定 因为按照预设的情况 是按照文件夹来进行区分资源
     * url= key+/name 可以得到单个资源的路径  所以key值必须要有name才能进缓存
     * @param bundle 分包名称 默认resources
     * @returns void 该方法仅作为加载资源 不返回资源
    */
    loadAsset(url: string, type: typeof Asset, name: string, bundle?: string) {
        return new Promise<void>(async (resolve, reject) => {
            let key = url.replace("/" + name, "");
            // 如果已经加载过该资源 则直接返回该资源
            if (this.resMap.has(key)) {
                let res = this.resMap.get(key);
                if (res) {
                    let item = res.find((item) => item.name === name);
                    if (item) {
                        resolve();
                        return;
                    }
                }
            }
            // 如果没有加载过该资源 则加载该资源
            const bundleAsset = bundle ? await this.getBundle(bundle) : resources;
            if (!bundleAsset) {
                reject();
                return;
            }
            bundleAsset.load(url, type, (err: Error, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.saveAsset(key, [res], type, name);
                resolve();
                return;
            })
        })
    }
    /**
     * @description 加载文件夹下的所有资源
     * @param url 资源路径
     * @param type 资源类型
     * @param bundle 分包名称 默认resources
     * @returns void 该方法仅作为加载资源 不返回资源
    */
    loadDir(url: string, type?: typeof Asset, bundle?: string, onProgress?: (v: number) => void) {
        return new Promise<void>(async (resolve, reject) => {
            if (this.resMap.has(url)) {
                let res = this.resMap.get(url);
                // 如果该key值有资源 则直接重新刷新该资源，防止重复加载相同资源或者说有单个资源提前污染缓存
                res = [];
            }
            const bundleAsset = bundle ? await this.getBundle(bundle) : resources;
            if (!bundleAsset) {
                reject();
                return;
            }
            if (!type) {
                bundleAsset.loadDir(url, (finish: number, total: number, item) => {
                    if (onProgress) {
                        onProgress(finish / total);
                    }
                }, (err, data: Asset[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.saveAsset(url, data);
                    resolve();
                });
            } else {
                bundleAsset.loadDir(url, (finish: number, total: number, item) => {
                    if (onProgress) {
                        onProgress(finish / total);
                    }
                }, (err, data: Asset[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.saveAsset(url, data, type);
                    resolve();
                });
            }
        })
    }
    //远程加载资源（暂时不需要）
    //#endregion 资源加载
    //#region 获取资源
    //按照名字获取资源
    //按照类型获取资源
    //按照路径获取资源 url= key+/name 可以得到单个资源的路径
    //#endregion 获取资源
    //#region Prefab对象池
    //#endregion Prefab对象池
    private saveAsset(key: string, res: Asset[], type?: typeof Asset, name?: string) {
        let res1: Asset = null;
        if (res.length == 1) {
            res1 = res[0];
            if (!this.resMap.has(key)) {
                this.resMap.set(key, []);
            }
            let item = this.resMap.get(key);
            if (item) {
                item.push({ name: name, data: res1, type: type });
            }
            return;
        }
        for (let i = 0; i < res.length; i++) {
            res1 = res[i];
            const name = res1.name;
            // 如果有type 则直接赋值 否则默认是Asset 类型 一般使用loadDir方法加载文件夹下的所有资源时 会默认赋值为Asset 类型
            this.resMap.get(key).push({ name: name, data: res1, type: type || Asset });
        }
        // this.resMap.set(key, item);
    }
    private Asset2Load() {

    }



}

export const resMgr = ResManager.instance;