import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, director, instantiate, IPhysics2DContact, Node, random, randomRange, RigidBody2D, v2, v3, Vec2, Vec3 } from 'cc';
import { ShootBase } from './ShootBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ShootInstant')
@requireComponent(ShootBase)
export class ShootInstant extends Component {

    @property(Node)
    Bullet: Node = null;

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

    @property({ group: { name: 'Shoot' }, type: Node })
    Target: Node = null;
    @property({ group: { name: 'Shoot' }, type: CCBoolean })
    Range: boolean = false;
    @property({ group: { name: 'Shoot' }, type: CCBoolean })
    Auto: boolean = false;

    @property({ group: { name: 'Loop' }, type: CCBoolean })
    Loop: boolean = false;
    @property({ group: { name: 'Loop' }, type: CCFloat })
    DelayLoop: number = 1;

    @property({ group: { name: 'Bullet' }, type: CCBoolean })
    BulletRotateActive: boolean = false;
    @property({ group: { name: 'Bullet' }, type: CCFloat })
    BulletRotate: number = 180;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagRange: number = 201;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_shootStage: boolean = false;

    m_targetInRange: Node[] = [];
    m_targetPos: Vec2 = v2();

    m_shoot: ShootBase = null;

    protected onLoad(): void {
        this.m_shoot = this.getComponent(ShootBase);

        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onShoot, this);

        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagRange) {
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                colliderCheck.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        });
    }

    protected start(): void {
        if (this.Target != null)
            this.m_targetInRange.push(this.Target);
        if (this.StartEvent)
            this.scheduleOnce(() => this.onShoot(), this.Delay);
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!this.Range)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1)
            this.onTargetEnter(otherCollider.node);
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!this.Range)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1)
            this.onTargetExit(otherCollider.node);
    }

    //

    private onTargetEnter(target: Node) {
        let targetIndex = this.m_targetInRange.findIndex((t) => t == target);
        if (targetIndex > -1)
            return;
        this.m_targetInRange.push(target);
        //
        if (!this.m_shootStage && this.Auto) {
            this.Target = this.m_targetInRange.find(t => t != null);
            this.onShoot();
        }
    }

    private onTargetExit(target: Node) {
        let targetIndex = this.m_targetInRange.findIndex((t) => t == target);
        if (targetIndex <= -1)
            return;
        this.m_targetInRange.splice(targetIndex, 1);
        //
        if (this.m_shootStage && this.m_targetInRange.length == 0) {
            this.unscheduleAllCallbacks();
            this.m_shootStage = false;
        }
        else
            this.Target = this.m_targetInRange.find(t => t != null);
    }

    onShoot() {
        this.m_shootStage = true;
        if (this.Target == null) {
            if (this.Auto) {
                if (this.m_targetInRange.length == 0){
                    this.scheduleOnce(()=> this.onShoot(), 0.2);
                    return;
                }
                this.Target = this.m_targetInRange.find(t => t != null);
                this.onShoot();
            }
            return;
        }
        let targetPos = this.Target.worldPosition.clone();
        this.m_targetPos = v2(targetPos.x, targetPos.y);
        this.m_shoot.onShootInstant(
            this.m_targetPos,
            this.Bullet,
            this.BulletRotateActive ? this.BulletRotate : null);
        if (this.Loop)
            this.scheduleOnce(() => this.onShoot(), this.DelayLoop);
        if (this.EmitEvent != '')
            director.emit(this.EmitEvent);
        if (this.OnceTrigger)
            director.off(this.OnEvent, this.onShoot, this);
    }
}