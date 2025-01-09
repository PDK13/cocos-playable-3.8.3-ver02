import { _decorator, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, RigidBody2D } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodyHazards')
@requireComponent(RigidBody2D)
export class BodyHazards extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_throw: boolean = false;

    protected onLoad(): void {
        let collider = this.getComponents(Collider2D);

        this.node.on(ConstantBase.ON_NODE_THROW, this.onThrow, this);

        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagRange) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_throw)
            return;
        if (selfCollider.tag != this.TagRange)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1)
            otherCollider.node.emit(ConstantBase.ON_NODE_HIT, this.Hit, this.node);
    }

    private onThrow() {
        this.m_throw = true;
        this.scheduleOnce(() => this.m_throw = false, 0.2);
    }
}