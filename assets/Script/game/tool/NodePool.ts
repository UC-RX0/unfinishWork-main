import { instantiate, Node, Prefab } from "cc";

export class NodePool {
    private pool: Node[] = [];

    constructor(private prefab: Prefab) {}

    get(): Node {
        let node: Node;
        if (this.pool.length > 0) {
            node = this.pool.pop();
            node.active = true;
        } else {
            node = instantiate(this.prefab);
        }
        return node;
    }

    put(node: Node) {
        node.active = false;
        node.removeFromParent();
        this.pool.push(node);
    }

    clear() {
        for (let n of this.pool) n.destroy();
        this.pool.length = 0;
    }
}