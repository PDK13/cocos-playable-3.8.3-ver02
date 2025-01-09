import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Sprite, tween, TweenEasing } from 'cc';
import { EaseType } from '../../BaseConstant';
const { ccclass, property } = _decorator;

@ccclass('SpriteFillOnce')
export class SpriteFillOnce extends Component {

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
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: CCFloat })
    FillTo: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    CompleteDestroy: boolean = false;

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
        tween(this.Target)
            .call(() => this.Target.fillRange = this.m_valueA)
            .to(this.Duration, { fillRange: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => {
                if (this.EmitEvent != '')
                    director.emit(this.EmitEvent);
            })
            .call(() => {
                if (this.CompleteDestroy)
                    this.scheduleOnce(() => this.node.destroy(), this.Fixed ? 0.02 : 0);
            })
            .start();
    }
}