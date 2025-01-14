import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventOnDestroy')
export class EventOnDestroy extends Component {

    //@property({ group: { name: 'Main' }, type: Node })
    @property({ type: [Node] })
    Target: Node[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.ON_NODE_EVENT, this.onEventDestroy, this);
    }

    protected start(): void {
        if (this.Target.length == 0)
            this.Target.push(this.node);
    }

    onEventDestroy() {
        this.scheduleOnce(() => {
            this.Target.forEach(target => {
                if (target != null ? target.isValid : false)
                    target.destroy();
            });
        }, 0);
    }
}