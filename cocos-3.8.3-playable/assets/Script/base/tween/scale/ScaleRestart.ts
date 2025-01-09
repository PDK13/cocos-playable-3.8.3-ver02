import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Tween, tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EaseType } from '../../BaseConstant';
const { ccclass, property } = _decorator;

@ccclass('ScaleRestart')
export class ScaleRestart extends Component {

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
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: Vec2 })
    ScaleTo: Vec2 = v2();
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayEach: number = 0;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    LimitCount: number = 1;

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
        this.m_valueA = v3(this.Target.scale.clone().x, this.Target.scale.clone().y, this.Target.scale.clone().z);
        this.m_valueB = v3(this.ScaleTo.clone().x, this.ScaleTo.clone().y, this.Target.scale.clone().z);

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
                    .call(() => this.node.scale = this.m_valueA.clone())
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayEach)
                )
                .start();
        }
        else {
            tween(this.Target)
                .repeatForever(tween(this.Target)
                    .call(() => this.node.scale = this.m_valueA.clone())
                    .to(this.Duration, { scale: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .delay(this.DelayEach)
                )
                .start();
        }
    }
}