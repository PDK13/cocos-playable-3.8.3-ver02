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

    @property({ group: { name: 'Main' }, type: EventType })
    Type: EventType = EventType.NONE;

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Start: boolean = false;
    //Start == FALSE
    @property({ group: { name: 'Main' }, type: CCString, visible(this: EventBase) { return !this.Start; } })
    OnEvent: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EventBase) { return !this.Start; } })
    Once: boolean = false;
    //Start == TRUE
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: EventBase) { return this.Start && this.Type > EventType.NONE; } })
    StartStage: boolean = true;
    @property({ group: { name: 'Main' }, type: Node, visible(this: EventBase) { return this.Start && this.Type > EventType.BOOLEAN; } })
    StartTarget: Node = null;

    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
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
                    this.onEventBoolean(this.StartStage);
                    break;
                case EventType.NODE:
                    this.onEventNode(this.StartStage, this.StartTarget);
                    break;
            }
        }
    }

    onEventNone() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventNone, this);
    }

    onEventBoolean(state: boolean) {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_EVENT, state);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, state);
        }, Math.max(this.Delay, 0));
        if (this.Once)
            director.off(this.OnEvent, this.onEventBoolean, this);
    }

    onEventNode(state: boolean, target: Node) {
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