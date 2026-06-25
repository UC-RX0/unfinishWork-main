export interface Entity {
    /**实体的唯一标识符*/
    id: number;
    /**实体的生成代号，用于判断实体是否被销毁*/
    generation: number;
}
export class EntityPool {
    /**实体id的下一个可用值*/
    public nextId: number = 0;
    /**空闲实体id列表*/
    public freeList: number[] = [];
    /**实体代号与实体id的映射表
     * 用于判断实体是否被销毁，每个实体的代号会增加1。
     * Key: 实体id
     * Value: 实体的当前代号，用于判断实体是否被销毁。
     */
    public generations: Map<number, number> = new Map();
    /**创建实体
     * 违反了对象池的意义，每次都会创建一个新的实体对象。
     * @returns 新创建的实体对象。
    */
    create(): Entity {
        let id = this.freeList.pop();
        if (id == undefined) {
            id = this.nextId++;
            this.generations.set(id, 0);
            return { id, generation: 0 };
        }
        let generation = this.generations.get(id);
        this.generations.set(id, generation + 1);
        return { id, generation: generation + 1 };
    }
    /**销毁实体*/
    destroy(entity: Entity) {
        let id = entity.id;
        if (this.freeList.findIndex((item) => item === id) == -1) {
            this.freeList.push(id);
        } else {
            return;
        }
    }
    /**
     * @description 判断实体是否存活 通过比较实体的代号与当前代号来判断。
     * 如果实体的代号与当前代号是否一致。
     * 如果一致，则实体存活。
     * 如果不一致，则实体已被销毁。
     * @param entity 实体对象
     * @returns 实体是否存活
    */
    isAlive(entity: Entity): boolean {
        let id = entity.id;
        let generation = this.generations.get(id);
        return generation === entity.generation;
    }


}