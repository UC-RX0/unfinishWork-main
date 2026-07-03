import { IComponent } from "../Base/IComponent";




export class HitCooldownComponent implements IComponent {

    cooldown: number = 0.5;
    timer: number = 0;


}