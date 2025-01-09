import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('FollowCollider')
@requireComponent(SpineBase)
export class FollowCollider extends Component {

    //@property({ group: { name: 'Follow' }, type: CCBoolean })
    @property(CCBoolean)
    Auto: boolean = false;

    //@property({ group: { name: 'Follow' }, type: Node })
    @property(Node)
    Follow: Node = null;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnFollow: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitFollow: string = ''
    @property({ group: { name: 'Event' }, type: CCBoolean })
    NodeEvent: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitNodeMove: string = '';

    @property({ group: { name: 'Move' }, type: CCBoolean })
    FaceX: boolean = true;
    @property({ group: { name: 'Move' }, type: CCFloat })
    SpeedMove: number = 15;
    @property({ group: { name: 'Move' }, type: CCFloat })
    SpeedRun: number = 25;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    StartRight: boolean = true;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimMove: string = 'move';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimRun: string = 'run';

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 200;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange1: number = 201;
    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange2: number = 202;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_folow: boolean = true;
    m_far: boolean = true;
    m_dir: number = 1;

    m_view: boolean = false;
    m_spine: SpineBase = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        if (this.OnFollow != '')
            director.on(this.OnFollow, this.onFollowEvent, this);

        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody ||
                colliderCheck.tag == this.TagRange1 ||
                colliderCheck.tag == this.TagRange2) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                colliderCheck.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        });
    }

    protected start(): void {
        this.m_dir = this.StartRight ? 1 : -1;
        this.m_spine.onFaceDir(this.StartRight ? 1 : -1);
        this.onFollowForce(this.Follow);
    }

    protected lateUpdate(dt: number): void {
        if (!this.getFollow()) {
            this.m_rigidbody.linearVelocity = Vec2.ZERO.clone();
            this.onViewFollow(false, false);
            if (this.NodeEvent)
                this.node.emit(this.EmitNodeMove, false);
            return;
        }

        let velocityDir = this.Follow.worldPosition.clone().subtract(this.node.worldPosition.clone()).clone().normalize();
        let velocity = velocityDir.multiplyScalar(this.m_far ? this.SpeedRun : this.SpeedMove).clone();
        this.m_rigidbody.linearVelocity = v2(velocity.x, velocity.y);

        this.onViewFollow(true, this.getFar());
        if (this.NodeEvent)
            this.node.emit(this.EmitNodeMove, true);
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node == this.node)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (selfCollider.tag == this.TagRange1)
                this.m_folow = false;
            if (selfCollider.tag == this.TagRange2)
                this.m_far = false;
            if (this.Auto && this.Follow == null)
                this.Follow = otherCollider.node;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node == this.node)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (selfCollider.tag == this.TagRange1)
                this.m_folow = true;
            if (selfCollider.tag == this.TagRange2)
                this.m_far = true;
        }
    }

    onFollowEvent(target: Node) {
        if (target == null)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.Follow = target;
            this.node.setParent(target.parent, true);
            if (this.EmitFollow != '')
                director.emit(this.EmitFollow);
        }, this.Delay)
        if (this.OnceTrigger)
            director.off(this.OnFollow, this.onFollowEvent, this);
    }

    onFollowForce(target: Node) {
        if (target == null)
            return;
        this.Follow = target;
        this.node.setParent(target.parent, true);
    }

    onStay() {
        this.Follow = null;
    }

    getDir(): number {
        if (this.Follow == null)
            return this.m_dir;
        this.m_dir = this.node.worldPosition.clone().x < this.Follow.worldPosition.clone().x ? 1 : -1;
        return this.m_dir;
    }

    getFollow(): boolean {
        if (this.Follow == null)
            this.m_folow = false;
        else if (!this.FaceX)
            this.m_folow = true;
        return this.m_folow;
    }

    getFar(): boolean {
        if (this.Follow == null)
            this.m_far = false;
        return this.m_far;
    }

    private onViewFollow(move: boolean, far: boolean) {
        this.m_spine.onFaceDir(this.getDir());
        if (!move) {
            if (!this.m_view) {
                this.m_view = true;
                this.m_spine.onAnimation(this.AnimIdle, true);
            }
        }
        else {
            this.m_view = false;
            if (far)
                this.m_spine.onAnimation(this.AnimRun, true);
            else
                this.m_spine.onAnimation(this.AnimMove, true);
        }
    }
}