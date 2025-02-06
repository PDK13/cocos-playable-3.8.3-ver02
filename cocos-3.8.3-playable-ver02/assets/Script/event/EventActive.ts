import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventActive')
export class EventActive extends Component {

    @property({ type: [Node] })
    Target: Node[] = [];
    @property(CCBoolean)
    TargetSelf: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.OnNode; } })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.Start && !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.Start && !this.OnNode && this.OnEvent != ''; } })
    OnEventState: boolean = true;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.Start && !this.OnNode; } })
    OnEventOn: string = '';
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.Start && !this.OnNode; } })
    OnEventOff: string = '';
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventActive) { return !this.Start && !this.OnNode; } })
    OnEventRevert: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventActive) { return !this.Start && !this.OnNode; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        else {
            director.on(this.OnEvent, this.onEvent, this);
            director.on(this.OnEventOn, this.onEventOn, this);
            director.on(this.OnEventOff, this.onEventOff, this);
            director.on(this.OnEventRevert, this.onEventRevert, this);
        }
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent(state?: boolean) {
        this.scheduleOnce(() => {
            this.onEventList(state);
            if (this.TargetSelf)
                this.onEventSingle(this.node, state);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    onEventOn() {
        this.onEvent(true);
    }

    onEventOff() {
        this.onEvent(false);
    }

    onEventRevert() {
        this.scheduleOnce(() => {
            this.onEventListRevert();
            if (this.TargetSelf)
                this.onEventSingleRevert(this.node);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    onEventList(state?: boolean) {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => {
            this.onEventSingle(target, state);
        });
        this.Target = this.Target.filter(t => t != null);
    }

    onEventListRevert() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => {
            this.onEventSingleRevert(target);
        });
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: Node, state?: boolean) {
        if (target == null ? true : !target.isValid)
            return;
        target.active = state != null ? state : this.OnEventState;
    }

    onEventSingleRevert(target: Node) {
        if (target == null ? true : !target.isValid)
            return;
        target.active = !target.active;
    }
}