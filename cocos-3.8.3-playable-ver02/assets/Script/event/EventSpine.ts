import { _decorator, CCBoolean, CCFloat, CCString, Component, director } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('EventSpine')
export class EventSpine extends Component {

    @property({ type: [SpineBase] })
    Target: SpineBase[] = [];
    @property(CCBoolean)
    TargetSelf: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventSpine) { return !this.OnNode; } })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventSpine) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventSpine) { return !this.Start && !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventSpine) { return !this.Start && !this.OnNode; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEventFinal: string = '';

    @property({ group: { name: 'Main' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Main' }, type: CCString })
    AnimLoop: string = '';
    @property({ group: { name: 'Main' }, type: CCFloat })
    AnimLoopDuration: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    AnimEnd: string = '';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimEndLoop: boolean = false;

    protected onLoad(): void {
        if (this.Start)
            return;
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
        else
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent() {
        this.scheduleOnce(() => {
            this.onEventList();
            if (this.TargetSelf)
                this.onEventSingle(this.node.getComponent(SpineBase));
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

    onEventList() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => {
            this.onEventSingle(target);
        });
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        target.scheduleOnce(() => {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEventFinal);
                }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
            }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimLoopDuration, 0));
        }, target.onAnimation(this.AnimStart, false));
    }
}