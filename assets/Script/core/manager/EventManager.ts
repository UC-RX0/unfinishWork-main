
interface IEvent {
    fun: Function;
    ctx: unknown;
}
class EventManager {

    private constructor() { }
    private static _instance: EventManager = null;
    public static get instance(): EventManager {
        if (this._instance == null) {
            this._instance = new EventManager();
        }
        return this._instance;
    }
    private eventMap: Map<string, IEvent[]> = new Map();

    on(eventName: string, fun: Function, ctx: unknown) {
        const eventList = this.eventMap.get(eventName);
        if (eventList) {
            eventList.push({ fun, ctx });
        } else {
            const newEventList: IEvent[] = [{ fun, ctx }];
            this.eventMap.set(eventName, newEventList);
        }
        console.log(eventName + "事件添加成功")
    }

    off(eventName: string, fun: Function, ctx: unknown) {
        const item = this.eventMap.get(eventName);
        if (!item) {
            console.log(eventName + "事件不存在")
            return
        }
        const eventIndex = item.findIndex((event) => event.fun === fun && event.ctx === ctx);
        if (eventIndex !== -1) {
            item.splice(eventIndex, 1);
        }
    }
    offWith(ctx?: unknown) {
        if (!ctx) {
            console.log("ctx不能为空")
            return
        }
        this.eventMap.forEach((eventList, key) => {
            this.eventMap.set(key, eventList.filter(event => event.ctx !== ctx));
        });
    }
    emit(eventName: string, ...args: any[]) {
        if (!this.eventMap.has(eventName)) {
            console.log(eventName + "事件不存在")
            return
        }
        const item = this.eventMap?.get(eventName);
        item?.forEach((event) => {
            event.ctx ? event.fun.apply(event.ctx, args) : event.fun(...args);
        });
    }

    clear() {
        this.eventMap.clear();
    }
}
export const eventMgr = EventManager.instance;

