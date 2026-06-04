export class Entity {
    constructor(
        public id: number,
        public generation: number
    ) {
        this.id = id;
        this.generation = generation;
    }
}


export class EntityPool {
    public nextId: number = 0;
    public freeList: number[] = [];
    public generations: Map<number, number> = new Map();

    create() {
        let id = this.freeList.pop();
        if (id == undefined) {
            id = this.nextId++;
            this.generations.set(id, 0);
            return new Entity(id, 0);
        }
        let generation = this.generations.get(id);
        this.generations.set(id, generation + 1);
        return new Entity(id, generation + 1);

    }

    destroy(entity: Entity) {
        let id = entity.id;
        if (this.freeList.findIndex((item) => item === id) == -1) {
            this.freeList.push(id);
        } else {
            return;
        }
    }

    isAlive(entity: Entity) {
        let id = entity.id;
        let generation = this.generations.get(id);
        return generation === entity.generation;
    }


}