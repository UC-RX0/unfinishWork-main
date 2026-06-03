/***
 * 黑板用来存储行为树所有信息
 * 暴露静态方法方便用户使用
 */
export class Blackboard {
  static map: Map<string, any> = new Map();

  static write(key: string, value: any) {
    this.map.set(key, value);
  }

  static read(key: string) {
    return this.map.get(key);
  }

  static has(key: string) {
    return this.map.has(key);
  }

  static delete(key: any) {
    return this.map.delete(key);
  }

  static clear() {
    this.map.clear();
  }
}
