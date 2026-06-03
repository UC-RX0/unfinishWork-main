export const nodeClsMap: Map<string, Function> = new Map();

/***
 * 收集被装饰的类，用来在运行时通过节点类型找到对应的class
 */
export const btclass = (name: string): ClassDecorator => {
  return function (target) {
    nodeClsMap.set(name, target);
  };
};
