export class entity {
    id: number;
    generation: number;
}


export class entityPool {
    public nextId: number = 0;
    public freeList: number[] = [];
    public generations: Map<number, number> = new Map();
}