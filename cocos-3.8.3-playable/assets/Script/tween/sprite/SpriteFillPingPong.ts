import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Sprite, Tween, tween, TweenEasing } from 'cc';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('SpriteFillPingPong')
export class SpriteFillPingPong extends Component {

    @property(Sprite)
    Target: Sprite = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    StartEvent: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitTo: boolean = true;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitBack: boolean = true;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: CCFloat })
    FillTo: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayTo: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayBack: number = 0;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    LimitCount: number = 1;

    m_valueA: number;
    m_valueB: number;

    protected onLoad(): void {
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Target == null)
            this.Target = this.getComponent(Sprite);
        if (this.StartEvent)
            this.onEvent();
    }

    //

    onEvent() {
        this.m_valueA = this.Target.fillRange;
        this.m_valueB = this.FillTo;

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.onTween(), this.Delay + (this.Fixed ? 0.02 : 0));

        if (this.OnceTrigger)
            director.off(this.OnEvent, this.onEvent, this);
    }

    private onTween() {
        Tween.stopAllByTarget(this.Target);
        if (this.Limit) {
            tween(this.Target)
                .repeat(this.LimitCount, tween(this.Target)
                    .to(this.Duration, { fillRange: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitTo && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayTo)
                    .to(this.Duration, { fillRange: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitBack && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayBack)
                )
                .start();
        }
        else {
            tween(this.Target)
                .repeatForever(tween(this.Target)
                    .to(this.Duration, { fillRange: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitTo && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayTo)
                    .to(this.Duration, { fillRange: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitBack && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayBack)
                )
                .start();
        }
    }
}