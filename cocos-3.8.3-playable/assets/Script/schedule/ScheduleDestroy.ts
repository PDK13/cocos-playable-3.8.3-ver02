import { _decorator, CCFloat, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScheduleDestroy')
export class ScheduleDestroy extends Component {

    @property(Node)
    Target: Node = null;

    //@property({ group: { name: 'Event' }, type: CCFloat })
    @property(CCFloat)
    Delay: number = 1;

    protected start(): void {
        if (this.Target == null)
            this.Target = this.node;
        this.scheduleOnce(() => {
            this.Target.destroy();
        }, this.Delay + 0.02);
    }
}