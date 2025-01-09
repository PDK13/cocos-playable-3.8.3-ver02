import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiPressEvent')
export class UiPressEvent extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    DelayStart: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitStart: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    DelayEnd: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEnd: string = '';

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onPressStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onPressEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
    }

    onPressStart() {
        if (this.EmitStart != '')
            this.scheduleOnce(() => director.emit(this.EmitStart), this.DelayStart);
        if (this.Once) {
            this.node.off(Input.EventType.TOUCH_START, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_END, this.onPressEnd, this);
            this.node.off(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
        }
    }

    onPressEnd() {
        if (this.EmitEnd != '')
            this.scheduleOnce(() => director.emit(this.EmitEnd), this.DelayEnd);
    }
}