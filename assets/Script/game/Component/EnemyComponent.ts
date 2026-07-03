import { IComponent } from "../Base/IComponent";


export class EnemyComponent implements IComponent {
    score: number = 0;
    wave: number = 0;
    attackRange: number = 80;

}