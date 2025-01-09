import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Enum, Node, Tween, tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EaseType } from '../../ConstantBase';
const { ccclass, property } = _decorator;

export enum CustomType {
    ONCE,
    PING_PONG,
    RESTART,
}
Enum(CustomType);

@ccclass('MoveTarget')
export class MoveTarget extends Component {

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
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitTo: boolean = true;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitBack: boolean = true;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: Node })
    MoveTo: Node = null;
    @property({ group: { name: 'Main' }, type: Vec2 })
    MoveOffset: Vec2 = v2();
    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fixed: boolean = true;
    @property({ group: { name: 'Main' }, type: CustomType })
    Custom: CustomType = CustomType.ONCE;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Limit: boolean = true;
    @property({ group: { name: 'Main' }, type: CCFloat })
    LimitCount: number = 1;

    m_valueA: Vec3;
    m_valueB: Vec3;
    m_valueTo: Vec3;

    //

    protected onLoad(): void {
        director.on(this.OnEvent, this.onMove, this);
    }

    protected start(): void {
        if (this.Target == null)
            this.Target = this.node;
        if (this.StartEvent)
            this.onMove();
    }

    onMove() {
        let moveA = this.Target.worldPosition.clone();
        let moveB = this.MoveTo.worldPosition.clone();
        this.m_valueA = v3(moveA.x, moveA.y, moveA.z);
        this.m_valueB = v3(moveB.x + this.MoveOffset.clone().x, moveB.y + this.MoveOffset.clone().y, moveA.z);
        this.m_valueTo = this.m_valueB;

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            switch (this.Custom) {
                case CustomType.ONCE:
                    this.onTweenOnce();
                    break;
                case CustomType.PING_PONG:
                    this.onTweenPingPong();
                    break;
                case CustomType.RESTART:
                    this.onTweenRestart();
                    break;
            }
        }, this.Delay + (this.Fixed ? 0.02 : 0));

        if (this.OnceTrigger)
            director.off(this.OnEvent, this.onMove, this);
    }

    private onTweenOnce() {
        Tween.stopAllByTarget(this.Target);
        tween(this.Target)
            .call(() => this.node.worldPosition = this.m_valueA.clone())
            .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => {
                if (this.EmitEvent != '')
                    director.emit(this.EmitEvent);
            })
            .start();
    }

    private onTweenPingPong() {
        Tween.stopAllByTarget(this.Target);
        if (this.Limit) {
            tween(this.Target)
                .repeat(this.LimitCount, tween(this.Target)
                    .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitTo && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .to(this.Duration, { worldPosition: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitBack && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    }))
                .start();
        }
        else {
            tween(this.Target)
                .repeatForever(tween(this.Target)
                    .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitTo && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                    .to(this.Duration, { worldPosition: this.m_valueA }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitBack && this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    }))
                .start();
        }
    }

    private onTweenRestart() {
        Tween.stopAllByTarget(this.Target);
        if (this.Limit) {
            tween(this.Target)
                .repeat(this.LimitCount, tween(this.Target)
                    .call(() => this.node.worldPosition = this.m_valueA.clone())
                    .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                )
                .start();
        }
        else {
            tween(this.Target)
                .repeatForever(tween(this.Target)
                    .call(() => this.node.worldPosition = this.m_valueA.clone())
                    .to(this.Duration, { worldPosition: this.m_valueB }, { easing: EaseType[this.Ease] as TweenEasing })
                    .call(() => {
                        if (this.EmitEvent != '')
                            director.emit(this.EmitEvent);
                    })
                )
                .start();
        }
    }
}