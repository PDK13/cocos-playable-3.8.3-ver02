import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Tween, tween, TweenEasing, v3, Vec3 } from 'cc';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('RotateOnce')
export class RotateOnce extends Component {

    @property(Node)
    Target: Node = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    StartEvent: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = ''

    @property({ group: { name: 'Main' }, type: CCFloat })
    RotateTo: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;

    @property({ group: { name: 'Option' }, type: CCBoolean })
    CompleteDestroy: boolean = false;

    m_valueA: Vec3;
    m_valueB: Vec3;

    //

    protected onLoad(): void {
        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onEvent, this);
    }

    protected start(): void {
        if (this.Target == null)
            this.Target = this.node;
        if (this.StartEvent)
            this.onEvent();
    }

    //

    onEvent() {
        this.m_valueA = v3(0, 0, this.Target.eulerAngles.clone().z);
        this.m_valueB = v3(0, 0, this.RotateTo.valueOf());

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.onTween(), this.Delay + (this.Fixed ? 0.02 : 0));

        if (this.OnceTrigger)
            director.off(this.OnEvent, this.onEvent, this);
    }

    private onTween() {
        Tween.stopAllByTarget(this.Target);
        tween(this.Target)
            .call(() => this.Target.eulerAngles = this.m_valueA.clone())
            .to(this.Duration, { eulerAngles: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
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