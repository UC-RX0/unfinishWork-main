import { Asset, assetManager, AssetManager, instantiate, JsonAsset, Node, Prefab, resources, sp, Sprite, SpriteFrame } from "cc";
import { gameParam } from "../game/GameSetting";


export interface IRes {
    name: string;
    type: typeof Asset.name;
    data: Asset;
}
/**
 * @description ResManager 相当于对项目文件夹进行管理
 * 每一个key对应一个文件夹
 * 每一个key下可以有多个资源 每一个资源都有一个名称 例如：Actor、Actor2、Actor3等
 * 异步方法过多 无法在同步代码块中执行资源加载的方法
 * 必须有一个同步方法来获取加载完成的资源 没有则throw错误 使用try-catch捕获错误
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
    /**
     * 是否已封盘。
     * ResBridge.boot() 全部加载完成后会调用 seal()，
     * 此后所有异步加载入口都会抛错，强制运行期只能走 ResBridge 的同步访问。
     */
    private sealed: boolean = false;
    /**封盘：关闭底层异步加载能力*/
    public seal(): void {
        this.sealed = true;
        console.log("[ResManager] 已封盘，运行期禁止任何异步资源加载");
    }
    /**是否已封盘*/
    public get isSealed(): boolean {
        return this.sealed;
    }
    /**封盘守卫*/
    private assertUnsealed(api: string): void {
        if (this.sealed) {
            throw new Error(
                `[ResManager] 资源层已封盘，禁止在运行期调用 ${api}。\n` +
                `ECS 内部不允许异步加载：请把该资源加入 AssetManifest，` +
                `由 ResBridge 在启动期统一加载，运行期改用 resBridge 的同步接口。`
            );
        }
    }
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
        this.assertUnsealed(`loadAsset(${key}, ${name})`);
        return new Promise<void>(async (resolve, reject) => {
            // key 为空串时表示资源位于 resources 根目录，此时 url 就是 name 本身
            let url = key ? key + "/" + name : name;
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
        this.assertUnsealed(`loadDir(${url})`);
        return new Promise<void>(async (resolve, reject) => {
            if (this.resMap.has(url)) {
                // 重置该 key 下的缓存，防止重复加载时与已存在的单项资源叠加导致重复
                this.resMap.set(url, []);
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
        this.assertUnsealed(`getAssetByName(${key}, ${name})`);
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
        this.assertUnsealed(`getAssetByType(${key})`);
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
        this.assertUnsealed(`getAssetByPath(${key})`);
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
        this.assertUnsealed(`getNodeFromPool(${name})`);
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
    public putNodeToPool(node: Node, name: string, key?: string) {
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
        if (!sp) {
            console.log("sp 为空--->ResManager.setSprite");
            return;
        }
        let spriteFrame = await this.getAssetByName(key, name) as SpriteFrame;
        if (!spriteFrame) {
            console.log("资源不存在--->ResManager.setSprite", key, name);
            return;
        }
        sp.spriteFrame = spriteFrame;
    }
    public async setSkeleton(spine: sp.Skeleton, key: string, name: string) {
        if (!spine) return;

        //暂时用不上
    }
    public getPrefab(key: string, name: string): Prefab {
        let prefab = this.resMap.get(key);
        let item: IRes = null;
        if (prefab) {
            item = prefab.find((item) => item.name === name);
        }
        // 原来这里在 item 为 null 时会直接 .data 造成空引用崩溃
        return item ? (item.data as Prefab) : null;
    }
    /**
     * @description 读取某个 key 下已缓存的全部资源（只读）
     * 供 ResBridge 在启动期构建强类型索引使用
     */
    public getAssetsByKey(key: string): IRes[] {
        return this.resMap.get(key) || [];
    }
    public getSpriteFrames(key: string): SpriteFrame[] {
        let spriteFrames = this.resMap.get(key);
        let result: Asset[] = [];
        if (spriteFrames) {
            result = spriteFrames.map((item) => item.data);
        }


        return result as SpriteFrame[];
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
    /**
     * @description 加载资源
     * 将资源加载到loadedResMap中 表示资源已加载
     * @param key 资源路径
     * @param name 资源名称
     * @param type 资源类型
     * @param bundle 资源包
     * @returns 资源
    */
    private async Asset2Load(key: string, name?: string, type?: typeof Asset, bundle?: string) {
        let res = this.resMap.get(key);
        // 如果资源不存在 则加载资源 加载单个资源
        if (!res && name) {
            // let url = key + "/" + name;
            console.log("加载资源--->ResManager.Asset2Load", key);
            await this.loadAsset(key, type, name, bundle);
            res = this.resMap.get(key);
        }
        // 如果资源不存在 则加载资源 加载文件夹下的所有资源
        if (!res && name == null) {
            await this.loadDir(key, type, bundle);
            res = this.resMap.get(key);
        }

        this.loadedResMap.set(key, res);
        console.log("资源加载成功--->ResManager.Asset2Load", this.loadedResMap);
        return res;
    }
}
export const resMgr = ResManager.instance;