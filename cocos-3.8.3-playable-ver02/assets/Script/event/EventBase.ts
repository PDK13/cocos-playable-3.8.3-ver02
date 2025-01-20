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

    @property({ group: { name: 'Event' }, type: EventType })
    Type: EventType = EventType.NONE;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventBase) { return this.Start && this.Type > EventType.NONE; } })
    StartState: boolean = true;
    @property({ group: { name: 'Event' }, type: Node, visible(this: EventBase) { return this.Start && this.Type > EventType.BOOLEAN; } })
    StartTarget: Node = null;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventBase) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventBase) { return !this.Start; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnEvent != '') {
            switch (this.Type) {
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
        if (this.Start) {
            switch (this.Type) {
                case EventType.NONE:
                    this.onEventNone();
                    break;
                case EventType.BOOLEAN:
                    this.onEventBoolean(this.StartState);
                    break;
                case EventType.NODE:
                    this.onEventNode(this.StartState, this.StartTarget);
                    break;
            }
        }
    }

    onEventNone() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.NODE_EVENT);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventNone, this);
    }

    onEventBoolean(state: boolean) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.NODE_EVENT, state);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventBoolean, this);
    }

    onEventNode(state: boolean, target: Node) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.NODE_EVENT, state, target);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state, target);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventNode, this);
    }
}