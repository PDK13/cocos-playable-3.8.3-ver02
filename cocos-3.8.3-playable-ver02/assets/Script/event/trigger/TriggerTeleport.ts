import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('TriggerTeleport')
@requireComponent(RigidBody2D)
export class TriggerTeleport extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Teleport' }, type: Node })
    Teleport: Node = null;
    @property({ group: { name: 'Teleport' }, type: CCBoolean })
    DirX: boolean = true;
    @property({ group: { name: 'Teleport' }, type: CCFloat })
    Offset: number = 0;

    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    protected onLoad(): void {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let TargetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (TargetIndex > -1)
            this.onTeleport(otherCollider.node);
    }

    onTeleport(target: Node) {
        let teleportPos = this.Teleport.worldPosition.clone();
        let teleportFix = target.worldPosition.clone().subtract(this.node.worldPosition.clone());
        if (this.DirX) {
            if (target.worldPosition.clone().x < this.node.worldPosition.clone().x)
                teleportPos.x += this.Offset;
            else
                teleportPos.x -= this.Offset;
            teleportPos.y += teleportFix.y;
        }
        else {
            if (target.worldPosition.clone().y < this.node.worldPosition.clone().y)
                teleportPos.y += this.Offset;
            else
                teleportPos.y -= this.Offset;
            teleportPos.x += teleportFix.x;
        }
        this.scheduleOnce(() => {
            let TargetBody = target.getComponent(RigidBody2D);
            if (TargetBody != null)
                TargetBody.sleep();
            target.worldPosition = teleportPos;
            target.updateWorldTransform();
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }, 0.02);
    }
}