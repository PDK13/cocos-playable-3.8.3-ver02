import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('EventBase')
@requireComponent(RigidBody2D)
export class EventBase extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EventBase) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent(...value: any[]) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, value);
        }, this.Delay);
        if (this.Once)
            director.off(this.OnEvent, this.onEvent, this);
    }
}