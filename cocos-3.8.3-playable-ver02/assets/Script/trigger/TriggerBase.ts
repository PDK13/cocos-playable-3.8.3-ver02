import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('TriggerBase')
@requireComponent(RigidBody2D)
export class TriggerBase extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Option' }, type: CCBoolean })
    Muti: boolean = false;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_triggerCount: number = 0;

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
        if (targetIndex > -1)
            this.onTriggerUpdate();
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1)
            this.onTriggerRemove();
    }

    //

    onTriggerUpdate() {
        this.m_triggerCount++;
        if (!this.Muti && this.m_triggerCount > 1)
            return;

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_TRIGGER, true);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, true);
        }, this.Delay);

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

    onTriggerRemove() {
        this.m_triggerCount--;
        if (!this.Muti && this.m_triggerCount > 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.node.emit(ConstantBase.ON_NODE_TRIGGER, false);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent, false);
        }, this.Delay);
    }
}