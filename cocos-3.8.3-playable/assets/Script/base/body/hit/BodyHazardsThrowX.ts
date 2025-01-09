import { _decorator, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import { BaseConstant } from '../../BaseConstant';
import { BodyCheckX } from '../physic/BodyCheckX';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodyHazardsThrowX')
@requireComponent(BodyCheckX)
@requireComponent(RigidBody2D)
export class BodyHazardsThrowX extends Component {

    @property({ group: { name: 'Hit' }, type: CCInteger })
    Hit: number = 1;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange: number = 300;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [200];

    m_bodyCheck: BodyCheckX = null;

    protected onLoad(): void {
        this.m_bodyCheck = this.getComponent(BodyCheckX);

        //this.node.on(BaseConstant.ON_NODE_PICK, this.onPick, this);
        //this.node.on(BaseConstant.ON_NODE_THROW, this.onThrow, this);

        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagRange) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.tag != this.TagRange)
            return;
        if (!this.m_bodyCheck.m_isBot) {
            let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
            if (targetIndex > -1) {
                otherCollider.node.emit(BaseConstant.ON_NODE_HIT, this.Hit, this.node);
                this.node.emit(BaseConstant.ON_NODE_HIT, this.Hit, this.node);
            }
        }
    }
}