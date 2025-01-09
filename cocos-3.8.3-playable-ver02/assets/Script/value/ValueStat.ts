import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, Enum, Input, Label, Node } from 'cc';
import { ValueCurrency } from './ValueCurrency';
const { ccclass, property } = _decorator;

export enum StatFerLevel {
    Add,
    Muti,
}
Enum(StatFerLevel);

@ccclass('ValueStat')
export class ValueStat extends Component {

    @property(ValueCurrency)
    Currency: ValueCurrency = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    EventStart: boolean = true;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitStat: string = '';

    @property({ group: { name: 'Stat' }, type: CCInteger })
    Level: number = 1;
    //
    @property({ group: { name: 'Stat' }, type: CCFloat })
    Stat: number = 1;
    @property({ group: { name: 'Stat' }, type: StatFerLevel })
    StatType: StatFerLevel = StatFerLevel.Add;
    @property({ group: { name: 'Stat' }, type: CCFloat })
    StatFerLevel: number = 1;
    //
    @property({ group: { name: 'Stat' }, type: CCFloat })
    Cost: number = 10;
    @property({ group: { name: 'Stat' }, type: StatFerLevel })
    CostType: StatFerLevel = StatFerLevel.Add;
    @property({ group: { name: 'Stat' }, type: CCFloat })
    CostFerLevel: number = 10;

    @property({ group: { name: 'Ui' }, type: CCString })
    UiLevelFront: string = 'Lv.';
    @property({ group: { name: 'Ui' }, type: CCFloat })
    UiStatMuti: number = 100;
    @property({ group: { name: 'Ui' }, type: CCFloat })
    UiCostMuti: number = 10;
    @property({ group: { name: 'Ui' }, type: Label })
    UiLevel: Label = null;
    @property({ group: { name: 'Ui' }, type: Label })
    UiStat: Label = null;
    @property({ group: { name: 'Ui' }, type: Label })
    UiCost: Label = null;
    @property({ group: { name: 'Ui' }, type: Node })
    UiButton: Node = null;
    @property({ group: { name: 'Ui' }, type: Node })
    UiButtonOn: Node = null;
    @property({ group: { name: 'Ui' }, type: Node })
    UiButtonOff: Node = null;

    protected onLoad(): void {
        this.UiButton.on(Input.EventType.TOUCH_START, this.onButtonPress, this);
        if (this.Currency != null)
            if (this.Currency.EmitUpdate != '')
                director.on(this.Currency.EmitUpdate, this.onViewUpdate, this);
    }

    protected start(): void {
        if (this.Currency != null)
            this.UiCostMuti = this.Currency.UiCurrentMuti;
        this.onViewUpdate();
        if (this.EventStart)
            if (this.EmitStat != '')
                director.emit(this.EmitStat, this.Stat);
    }

    onButtonPress() {
        if (this.Currency != null ? !this.Currency.onUse(this.Cost) : false)
            return;
        this.onLevelUp(1);
    }

    onLevelUp(Value: number) {
        for (let i = 0; i < Value; i++) {
            this.Level++;
            switch (this.StatType) {
                case StatFerLevel.Add:
                    this.Stat += this.StatFerLevel;
                    break;
                case StatFerLevel.Muti:
                    this.Stat *= this.StatFerLevel;
                    break;
            }
            switch (this.CostType) {
                case StatFerLevel.Add:
                    this.Cost += this.CostFerLevel;
                    break;
                case StatFerLevel.Muti:
                    this.Cost *= this.CostFerLevel;
                    break;
            }
        }
        if (this.EmitStat != '')
            director.emit(this.EmitStat, this.Stat);
        this.onViewUpdate();
    }

    onViewUpdate() {
        if (this.UiLevel != null)
            this.UiLevel.string = this.UiLevelFront + this.Level.toString();
        if (this.UiStat != null)
            this.UiStat.string = (this.Stat * this.UiStatMuti).toString();
        if (this.UiCost != null)
            this.UiCost.string = (this.Cost * this.UiCostMuti).toString();
        if (this.UiButtonOn != null)
            this.UiButtonOn.active = this.Currency != null ? this.Currency.Current >= this.Cost : true;
        if (this.UiButtonOff != null)
            this.UiButtonOff.active = this.Currency != null ? this.Currency.Current < this.Cost : false;
    }
}