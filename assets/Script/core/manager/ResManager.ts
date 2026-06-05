import { Asset, assetManager, AssetManager, instantiate, JsonAsset, Node, Prefab, resources, sp, Sprite, SpriteFrame } from "cc";
import { gameParam } from "../game/GameSetting";
import { LayerEnum } from "./UIManager";

interface IRes {
    name: string;
    type: typeof Asset.name;
    data: Asset;
}
/**
 * @description ResManager 相当于对项目文件夹进行管理
 * 每一个key对应一个文件夹
 * 每一个key下可以有多个资源 每一个资源都有一个名称 例如：Actor、Actor2、Actor3等
 * */
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
     * @description 实质上双线并行的方法不确定是否有效，感觉十分冗余，因为不做GC的话 用双线其实也没有什么作用
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
    loadAsset(key: string, type: typeof Asset = Asset, name: string, bundle?: string) {
        return new Promise<void>(async (resolve, reject) => {
            let url = key + "/" + name;
            console.log("资源加载Key", key);
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
            if (type == null || type == undefined) {
                type = Asset;
            }
            // 如果没有加载过该资源 则加载该资源
            const bundleAsset = bundle ? await this.getBundle(bundle) : resources;
            console.log("资源加载Bundle", bundleAsset.name);
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
                console.log("资源加载成功", this.resMap)
                resolve();
                return;
            })
        })
    }
    /**
     * @description 加载文件夹下的所有资源
     * @param key 资源路径 
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
    loadRemoteAsset(url: string) {
        // 远程加载资源
        if (gameParam.isRemote == 0) {
            return;
        }
        // 远程加载资源 暂时不会用
        assetManager.loadRemote(url);
    }
    /**
     * @description 不走缓存 加载Json资源 加载完直接返回JsonAsset对象
     * 以供Config类解析Json文件并赋值
     * 然后项目后续直接访问Config类获取数据
     */
    loadJsonAsset(key: string, name: string, bundle?: string): Promise<JsonAsset> {
        return new Promise<JsonAsset>(async (resolve, reject) => {
            let url = key + "/" + name;
            const bundleAsset = bundle ? await this.getBundle(bundle) : resources;
            if (!bundleAsset) {
                reject();
                return;
            }
            bundleAsset.load(url, JsonAsset, (err: Error, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log("Json加载成功--->ResManager.loadJsonAsset", res);
                resolve(res);
            });
        })
    }
    //#endregion 资源加载
    //#region 获取资源
    //按照名字获取资源
    // 有该怎么办 没有该怎么办
    /**
     * @description 按照名称获取资源
     * 有则返回 没有则加载该资源
     * @param url 资源路径
     * @param name 资源名称
     * @param bundle 分包名称 默认resources
     * @param type 资源类型
     * @returns 资源数组 如果只有一个资源 则返回该资源
    */
    async getAssetByName(key: string, name: string, bundle?: string, type?: typeof Asset) {
        // let key = url.replace("/" + name, "");
        let url = key + "/" + name;
        let res: IRes[] = this.loadedResMap.get(key);
        if (!res) {
            res = await this.Asset2Load(key, name, type, bundle);
        }
        let result: Asset[] = [];
        if (res.length > 0) {
            res.forEach((item) => {
                if (item.name === name) {
                    result.push(item.data);
                }
            })
        } else {
            throw new Error("资源不存在");
        }
        return result.length == 1 ? result[0] : result;
    }
    //按照类型获取资源
    async getAssetByType(key: string, type: typeof Asset, name?: string, bundle?: string) {
        let res: IRes[] = this.loadedResMap.get(key);
        if (!res) {
            res = await this.Asset2Load(key, name, type, bundle);
        }
        let result: Asset[] = [];
        if (res.length > 0) {
            res.forEach((item) => {
                if (item.type === type.name) {
                    result.push(item.data);
                }
            })
        } else {
            throw new Error("资源不存在");
        }
        return result.length == 1 ? result[0] : result;
    }
    //按照路径获取资源 url= key+/name 可以得到单个资源的路径
    // 如果name为空 则默认返回该路径下的所有资源
    /**
     * @description 按照路径获取资源
     * @param url 资源路径
     * @param name 资源名称
     * @returns 资源
    */
    async getAssetByPath(key: string, name?: string, bundle?: string, type?: typeof Asset) {
        let res: IRes[] = this.loadedResMap.get(key);
        if (!res) {
            res = await this.Asset2Load(key, name, type, bundle);
        }
        let result: Asset[] = [];
        if (res.length > 0) {
            result = res.map((item) => item.data);
        } else {
            throw new Error("资源不存在");
        }
        return result.length == 1 ? result[0] : result;
    }
    //#endregion 获取资源
    //#region Prefab对象池   GC 必须要有GC 没有GC无法解决对象池在低负载下的内存问题
    /**Prefab对象池 用路径作为键   值为Prefab对象数组  */
    private NodePool: Map<string, Node[]> = new Map();
    public async getNodeFromPool(key: string, name: string) {
        let url = name;
        let pool = this.getPool(url);
        if (pool.length > 0) {
            return pool.pop();
        }
        // 如果对象池中没有 则创建一个节点
        let prefab: Prefab = await this.getAssetByName(key, name) as Prefab;
        let node = instantiate(prefab);
        return node;
    }
    public async putNodeToPool(node: Node, name: string, key?: string) {
        if (!node) return;
        let url = name;
        let pool = this.getPool(url);
        if (pool) {
            node.parent = null;
            pool.push(node);
        }
        console.log("对象池中添加节点--->ResManager.putNodeToPool", this.NodePool);
    }
    private getPool(url: string): Node[] {
        let pool = this.NodePool.get(url);
        if (!pool) {
            pool = [];
            this.NodePool.set(url, pool);
        }
        return pool;
    }
    //#endregion 
    //#region 获取特定资源
    public async setSprite(sp: Sprite, key: string, name: string) {
        if (!sp) return;
        let spriteFrame = await this.getAssetByName(key, name) as SpriteFrame;
        if (!spriteFrame) return;
        sp.spriteFrame = spriteFrame;
    }
    public async setSkeleton(spine: sp.Skeleton, key: string, name: string) {
        if (!spine) return;

        //暂时用不上
    }
    //#endregion
    private saveAsset(key: string, res: Asset[], type?: typeof Asset, name?: string) {
        let res1: Asset = null;
        if (res.length == 1) {
            res1 = res[0];
            if (!this.resMap.has(key)) {
                this.resMap.set(key, []);
            }
            let item = this.resMap.get(key);
            if (item) {
                item.push({ name: name || res1.name, data: res1, type: type.name || res1.constructor.name });
            }
            console.log("资源加载成功--->ResManager.saveAsset", this.resMap);
            return;
        }
        for (let i = 0; i < res.length; i++) {
            res1 = res[i];
            const name = res1.name;
            // 如果有type 则直接赋值 否则默认是Asset 类型 一般使用loadDir方法加载文件夹下的所有资源时 会默认赋值为Asset 类型
            let item = this.resMap.get(key);
            if (!item) {
                item = [];
            }
            if (name) {
                item.push({ name: name, data: res1, type: res1.constructor.name });
            }
            this.resMap.set(key, item);
        }
        console.log("资源加载成功--->ResManager.saveAsset", this.resMap);
        // this.resMap.set(key, item);
    }
    //待研究一下 是否能承担作用
    private async Asset2Load(key: string, name?: string, type?: typeof Asset, bundle?: string) {
        let res = this.resMap.get(key);
        if (!res && name) {
            // let url = key + "/" + name;
            console.log("加载资源--->ResManager.Asset2Load", key);
            await this.loadAsset(key, type, name, bundle);
            res = this.resMap.get(key);
        }
        this.loadedResMap.set(key, res);
        console.log("资源加载成功--->ResManager.Asset2Load", this.loadedResMap);
        return res;
    }
}
export const resMgr = ResManager.instance;