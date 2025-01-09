import { _decorator, CCFloat, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScheduleActive')
export class ScheduleActive extends Component {

    @property(Node)
    Target: Node = null;

    //@property({ group: { name: 'Event' }, type: CCFloat })
    @property(CCFloat)
    Delay: number = 1;

    protected start(): void {
        if (this.Target == null)
            this.Target = this.node;
        this.scheduleOnce(() => {
            this.Target.active = !this.Target.active;
        }, this.Delay + 0.02);
    }
}