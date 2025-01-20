import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, TweenEasing, v2, Vec2 } from 'cc';
import { ConstantBase, EaseType } from '../../ConstantBase';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('TriggerCamera')
export class TriggerCamera extends Component {

    // @property({ group: { name: 'Main' }, type: SpineBase })
    // Target: SpineBase[] = [];
    // @property({ group: { name: 'Main' }, type: CCBoolean })
    // TargetSelf: boolean = false;
    // @property({ group: { name: 'Main' }, type: CCBoolean })
    // TargetContact: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'View' }, type: CCBoolean })
    ValueChange: boolean = false;
    @property({ group: { name: 'View' }, type: CCFloat, visible(this: TriggerCamera) { return this.ValueChange; } })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'View' }, type: Vec2, visible(this: TriggerCamera) { return this.ValueChange; } })
    Offset: Vec2 = v2(0, 0);

    @property({ group: { name: 'Scale' }, type: CCBoolean })
    ScaleChange: boolean = false;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: TriggerCamera) { return this.ScaleChange; } })
    Scale: number = 1;
    @property({ group: { name: 'Scale' }, type: CCFloat, visible(this: TriggerCamera) { return this.ScaleChange; } })
    ScaleDuration: number = 0.5;
    @property({ group: { name: 'Scale' }, type: EaseType, visible(this: TriggerCamera) { return this.ScaleChange; } })
    ScaleEasing: EaseType = EaseType.linear;

    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetChange: boolean = false;
    @property({ group: { name: 'Target' }, type: Node, visible(this: TriggerCamera) { return this.TargetChange; } })
    Target: Node = null;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: TriggerCamera) { return this.TargetChange; } })
    TargetTween: boolean = false;
    @property({ group: { name: 'Target' }, type: CCFloat, visible(this: TriggerCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenDuration: number = 0.5;
    @property({ group: { name: 'Target' }, type: CCString, visible(this: TriggerCamera) { return this.TargetChange && this.TargetTween; } })
    TargetTweenEasing: TweenEasing = 'linear';

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    Effect: boolean = false;
    @property({ group: { name: 'Effect' }, type: CCBoolean, visible(this: TriggerCamera) { return this.Effect; } })
    EffectShake: boolean = false;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEvent();
            // if (this.TargetSelf)
            //     this.onEventSingle(this.node);
            // if (this.TargetContact)
            //     this.onEventSingle(otherCollider.node);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagBody:
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            });
        }
    }

    onEvent() {
        // this.Target = this.Target.filter(t => t != null);
        // this.Target.forEach(target => {
        //     this.onEventSingle(target);
        // });
        // this.Target = this.Target.filter(t => t != null);

        if (this.ValueChange) {
            director.emit(ConstantBase.CAMERA_VALUE_SMOOTH_TIME, this.SmoothTime);
            director.emit(ConstantBase.CAMERA_VALUE_OFFSET, this.Offset);
        }

        if (this.ScaleChange)
            director.emit(ConstantBase.CAMERA_VALUE_SCALE, this.Scale, this.ScaleDuration, this.ScaleEasing);

        if (this.TargetChange) {
            if (this.TargetTween)
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.Target, this.TargetTweenDuration, this.TargetTweenEasing);
            else
                director.emit(ConstantBase.CAMERA_TARGET_SWITCH, this.Target);
        }

        if (this.Effect) {
            director.emit(ConstantBase.CAMERA_EFFECT_SHAKE, this.EffectShake);
        }

        if (this.EmitEvent != '')
            director.emit(this.EmitEvent);
    }

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        //...
    }
}