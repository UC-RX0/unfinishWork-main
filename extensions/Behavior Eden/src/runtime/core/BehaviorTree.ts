import { _decorator, Component, JsonAsset, Node, director, CCBoolean } from "cc";
import { NodeStatus } from "../node";
import { BehaviorEditor } from "./BehaviorEditor";
import { BehaviorManager } from "./BehaviorManager";
import { BehaviorSource } from "./BehaviorSource";

const { ccclass, property, requireComponent } = _decorator;

interface IItem {
  cb: Function;
  ctx: unknown;
}

export enum BehaviorTreeEvent {
  BehaviorTreeStart,
  BehaviorTreeEnd,
}

/***
 * 用户真正使用的组件，用来设置单个行为树的运行参数
 */
@ccclass("BehaviorTree")
@requireComponent(BehaviorEditor)
export class BehaviorTree extends Component {
  @property(JsonAsset)
  asset: JsonAsset = null!;

  @property(CCBoolean)
  restartWhenComplete = false;

  @property(CCBoolean)
  startWhenEnabled = true;

  /***
   * true：节点失活的时候，行为树会保留，仅暂停运行
   * false：节点失活的时候，行为树直接删除
   */
  @property(CCBoolean)
  pauseWhenDisabled = false;

  @property(CCBoolean)
  logNodeChange = false;

  // 是否被暂停运行了（未开始执行的行为树或者被删除的树都不属于暂停）
  isPaused = false;

  // 是否执行完start生成周期，防止start和onEnable重复执行enableBehavior
  isInit = false;

  behaviorSource: BehaviorSource = new BehaviorSource();

  private map: Map<BehaviorTreeEvent, Array<IItem>> = new Map();

  // 当前行为树状态
  status: NodeStatus = NodeStatus.Inactive;

  onLoad() {
    // 解析json文件
    this.behaviorSource.parse(this.asset.json);
  }

  /***
   * 仅enableBehavior和disableBehavior属于供用户在自定义脚本中管理单个行为树的方法
   * 其他方法请勿使用
   */
  enableBehavior() {
    this.createBehaviorManager();
    if (BehaviorManager.instance) {
      BehaviorManager.instance.enableBehavior(this);
    }
  }

  disableBehavior(pause = this.pauseWhenDisabled) {
    if (BehaviorManager.instance) {
      BehaviorManager.instance.disableBehavior(this, pause);
      this.isPaused = pause;
    }
  }

  start() {
    if (this.startWhenEnabled) {
      this.enableBehavior();
    }
    this.isInit = true;
  }

  onEnable() {
    if (!this.isInit) {
      return;
    }

    // 运行被暂停或者startWhenEnabled的树
    if (this.isPaused || this.startWhenEnabled) {
      this.enableBehavior();
      this.isPaused = false;
    }
  }

  onDisable() {
    this.disableBehavior();
  }

  createBehaviorManager() {
    if (!BehaviorManager.instance) {
      const node = new Node("BehaviorManager");
      BehaviorManager.instance = node.addComponent(BehaviorManager);
      director.getScene()!.addChild(node);
    }
  }

  /***
   * 发布订阅
   */
  on(event: BehaviorTreeEvent, cb: Function, ctx: unknown) {
    if (this.map.has(event)) {
      this.map.get(event)!.push({ cb, ctx });
    } else {
      this.map.set(event, [{ cb, ctx }]);
    }
  }

  off(event: BehaviorTreeEvent, cb: Function, ctx: unknown) {
    if (this.map.has(event)) {
      const index = this.map.get(event)!.findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this.map.get(event)!.splice(index, 1);
    }
  }

  emit(event: BehaviorTreeEvent, ...params: unknown[]) {
    if (this.map.has(event)) {
      this.map.get(event)!.forEach(({ cb, ctx }) => {
        cb.apply(ctx, params);
      });
    }
  }

  clear() {
    this.map.clear();
  }

  /***
   * 插件面板初始化时调用
   */
  async getAssetUrl() {
    if (!this.asset) {
      return;
    }
    const uuid = this.asset._uuid;
    // 获取当前json的url
    const url = await Editor.Message.request("asset-db", "query-url", uuid);
    return url;
  }
}
