"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.btclass = exports.nodeClsMap = void 0;
exports.nodeClsMap = new Map();
/***
 * 收集被装饰的类，用来在运行时通过节点类型找到对应的class
 */
const btclass = (name) => {
    return function (target) {
        exports.nodeClsMap.set(name, target);
    };
};
exports.btclass = btclass;
