import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, Enum, IPhysics2DContact, math, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

export enum EventType {
    NONE,
    BOOLEAN,
    NODE,
};
Enum(EventType);

@ccclass('TriggerBase')
@requireComponent(RigidBody2D)
export class TriggerBase extends Component {

    @property({ group: { name: 'Event' }, type: EventType })
    Type: EventType = EventType.NONE;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    protected onLoad() {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    break;
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            switch (this.Type) {
                case EventType.NONE:
                    this.node.emit(ConstantBase.NODE_EVENT);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent);
                    break;
                case EventType.BOOLEAN:
                    this.node.emit(ConstantBase.NODE_EVENT, true);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent, true);
                    break;
                case EventType.NODE:
                    this.node.emit(ConstantBase.NODE_EVENT, true, otherCollider.node);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent, true, otherCollider.node);
                    break;
            }
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagBody:
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
                        break;
                }
            });
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            switch (this.Type) {
                case EventType.NONE:
                    this.node.emit(ConstantBase.NODE_EVENT);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent);
                    break;
                case EventType.BOOLEAN:
                    this.node.emit(ConstantBase.NODE_EVENT, false);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent, false);
                    break;
                case EventType.NODE:
                    this.node.emit(ConstantBase.NODE_EVENT, false, otherCollider.node);
                    if (this.EmitEvent != '')
                        director.emit(this.EmitEvent, false, otherCollider.node);
                    break;
            }
        }, Math.max(this.Delay, 0));
    }
}