"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blackboard = void 0;
/***
 * 黑板用来存储行为树所有信息
 * 暴露静态方法方便用户使用
 */
class Blackboard {
    static write(key, value) {
        this.map.set(key, value);
    }
    static read(key) {
        return this.map.get(key);
    }
    static has(key) {
        return this.map.has(key);
    }
    static delete(key) {
        return this.map.delete(key);
    }
    static clear() {
        this.map.clear();
    }
}
Blackboard.map = new Map();
exports.Blackboard = Blackboard;
