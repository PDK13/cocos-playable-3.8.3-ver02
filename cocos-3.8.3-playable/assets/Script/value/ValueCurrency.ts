import { _decorator, CCFloat, CCString, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueCurrency')
export class ValueCurrency extends Component {

    @property({ group: { name: 'Event' }, type: CCString })
    EmitUse: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitUpdate: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    OnCollect: string = '';

    @property({ group: { name: 'Currency' }, type: CCFloat })
    Current: number = 100;
    @property({ group: { name: 'Currency' }, type: CCFloat })
    Collect: number = 10;
    @property({ group: { name: 'Currency' }, type: CCFloat })
    Limit: number = 1000;

    @property({ group: { name: 'Ui' }, type: CCFloat })
    UiCurrentMuti: number = 10;
    @property({ group: { name: 'Ui' }, type: Label })
    UiCurrent: Label = null;

    protected onLoad(): void {
        if (this.OnCollect != '')
            director.on(this.OnCollect, this.onCollect, this);
    }

    protected start(): void {
        this.onViewUpdate();
    }

    onUse(Value: number): boolean {
        if (this.Current < Value)
            return false;
        this.Current -= Value;
        if (this.EmitUse != '')
            director.emit(this.EmitUse, Value);
        this.onViewUpdate();
        return true;
    }

    onCollect(Value: number) {
        this.Current = Math.min(this.Limit, this.Current + (Value != undefined ? Value : this.Collect));
        this.onViewUpdate();
    }

    onViewUpdate() {
        if (this.UiCurrent != null)
            this.UiCurrent.string = (this.Current * this.UiCurrentMuti).toString();
        if (this.EmitUpdate != '')
            director.emit(this.EmitUpdate, this.Current);
    }
}