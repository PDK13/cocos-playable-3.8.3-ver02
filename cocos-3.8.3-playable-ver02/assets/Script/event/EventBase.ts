import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Enum, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum EventType {
    NONE,
    BOOLEAN,
    NODE,
};
Enum(EventType);

@ccclass('EventBase')
export class EventBase extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Main' }, type: EventType, visible(this: EventBase) { return !this.Start; } })
    EventType: EventType = EventType.NONE;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EventBase) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnEvent != '') {
            switch (this.EventType) {
                case EventType.NONE:
                    director.on(this.OnEvent, this.onEventNone, this);
                    break;
                case EventType.BOOLEAN:
                    director.on(this.OnEvent, this.onEventBoolean, this);
                    break;
                case EventType.NODE:
                    director.on(this.OnEvent, this.onEventNode, this);
                    break;
            }
        }
    }

    protected start(): void {
        if (this.Start)
            this.onEventNone();
    }

    protected onEventNone() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventNone, this);
    }

    protected onEventBoolean(state: boolean) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT, state);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventBoolean, this);
    }

    protected onEventNode(state: boolean, target: Node) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT, state, target);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state, target);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventNode, this);
    }
}