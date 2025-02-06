import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('TriggerSpine')
export class TriggerSpine extends Component {

    @property({ group: { name: 'Target' }, type: [SpineBase] })
    Target: SpineBase[] = [];
    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetSelf: boolean = false;
    @property({ group: { name: 'Target' }, type: CCBoolean })
    TargetContact: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEventFinal: string = '';

    @property({ group: { name: 'Option' }, type: CCString })
    AnimStart: string = '';
    @property({ group: { name: 'Option' }, type: CCString })
    AnimLoop: string = '';
    @property({ group: { name: 'Option' }, type: CCFloat })
    AnimLoopDuration: number = 0;
    @property({ group: { name: 'Option' }, type: CCString })
    AnimEnd: string = '';
    @property({ group: { name: 'Option' }, type: CCBoolean })
    AnimEndLoop: boolean = false;

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
            this.node.on(ConstantBase.NODE_EVENT, this.onEventList, this);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEventList();
            if (this.TargetSelf)
                this.onEventSingle(this.node.getComponent(SpineBase));
            if (this.TargetContact)
                this.onEventSingle(otherCollider.node.getComponent(SpineBase));
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

    onEventList() {
        this.Target = this.Target.filter(t => t != null);
        this.Target.forEach(target => {
            this.onEventSingle(target);
        });
        this.Target = this.Target.filter(t => t != null);
    }

    onEventSingle(target: SpineBase) {
        if (target == null ? true : !target.isValid)
            return;
        target.scheduleOnce(() => {
            target.scheduleOnce(() => {
                target.scheduleOnce(() => {
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEventFinal);
                }, target.onAnimation(this.AnimEnd, this.AnimEndLoop));
            }, Math.max(target.onAnimation(this.AnimLoop, true), this.AnimLoopDuration, 0));
        }, target.onAnimation(this.AnimStart, false));
    }
}