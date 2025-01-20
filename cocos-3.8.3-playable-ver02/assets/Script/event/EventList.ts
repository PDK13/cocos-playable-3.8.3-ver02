import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Enum, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum ListType {
    FORWARD,
    LOOP,
    REVERT,
};
Enum(ListType);

@ccclass('EventList')
export class EventList extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventList) { return !this.OnNode; } })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventList) { return !this.Start; } })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString, visible(this: EventList) { return !this.Start && !this.OnNode; } })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean, visible(this: EventList) { return !this.Start && !this.OnNode; } })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    OnStop: string = '';

    @property({ group: { name: 'Main' }, type: ListType })
    ListType: ListType = ListType.FORWARD;
    @property({ group: { name: 'Main' }, type: [CCString] })
    List: string[] = [];
    @property({ group: { name: 'Main' }, type: CCBoolean })
    DelayEachStart: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayEach: number = 1;

    m_index: number = 0;
    m_quantity: number = 1;

    protected onLoad(): void {
        if (!this.Start) {
            if (this.OnNode)
                this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.on(this.OnEvent, this.onEvent, this);
        }
        director.on(this.OnStop, this.onStop, this);
    }

    protected start(): void {
        if (this.Start)
            this.onEvent();
    }

    onEvent() {
        this.scheduleOnce(() => this.onEventEach(), Math.max(this.Delay, 0));
        if (this.Once) {
            if (this.OnNode)
                this.node.off(ConstantBase.NODE_EVENT, this.onEvent, this);
            else
                director.off(this.OnEvent, this.onEvent, this);
        }
    }

    onEventEach() {
        if (this.DelayEachStart)
            this.scheduleOnce(() => this.onEventProgress(), this.DelayEach);
        else
            this.onEventProgress();
    }

    protected onEventProgress() {
        if (this.List[this.m_index] != '') {
            director.emit(this.List[this.m_index]);
            this.onListNext();
        }
    }

    protected onListNext() {
        this.m_index += this.m_quantity;
        if (this.m_index < 0 || this.m_index > this.List.length - 1) {
            switch (this.ListType) {
                case ListType.FORWARD:
                    this.m_index = this.m_quantity == 1 ? this.List.length - 1 : 0;
                    return;
                case ListType.LOOP:
                    this.m_index = this.m_quantity == 1 ? 0 : this.List.length - 1;
                    break;
                case ListType.REVERT:
                    this.m_quantity *= -1;
                    this.m_index += this.m_quantity;
                    break;
            }
        }
        if (this.DelayEachStart)
            this.onEventEach();
        else
            this.scheduleOnce(() => this.onEventEach(), this.DelayEach);
    }

    onStop() {
        this.unscheduleAllCallbacks();
    }
}