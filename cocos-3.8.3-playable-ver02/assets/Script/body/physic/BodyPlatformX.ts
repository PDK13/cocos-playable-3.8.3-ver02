import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, IPhysics2DContact, macro, PhysicsSystem2D, RigidBody2D, VERSION } from 'cc';
import { StateBase } from '../../state/StateBase';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodyPlatformX')
@requireComponent(RigidBody2D)
export class BodyPlatformX extends Component {

    /* NOTE HOW TO SET UP:
       Platform should have atleast 2 Collider(s) (should be BoxCollider2D component) to have full progess:
       - First with tag -2 for only Player (should have Bot Check with BodyCheck.cs component).
       - Second with tag -3 for check Player motion when collide with this.
       [Collider with tag -2 and -3 must have layer can affect with Player's layer body collider]
       - Final with tag -1 (optional) for another object(s) (such as monster, bullet, box, etc).
       [Collider with tag -1 must have layer can't affect only with Player's layer body collider]
    */

    @property({ group: { name: 'Main' }, type: CCBoolean })
    StayContact: boolean = false;

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagPlatform: number = -2; //Collider that collide with only Player without any Object(s) else
    @property({ group: { name: 'Self' }, type: CCInteger })
    TagCheck: number = -3; //Collider that used to check Player before it will collide with Platform

    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlayerBot: number = 98;

    m_colliderStaySchedule: any = null; //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1

    m_rigidbody: RigidBody2D = null;
    m_colliderPlatform: Collider2D = null;
    m_colliderCheck: Collider2D = null;

    m_state: StateBase = null;

    get m_checkWorldPosY(): number {
        //Get world pos Y to check Player current on top or bot of Platform (Collider Check)
        return this.m_colliderCheck.worldAABB.center.clone().y;
    };

    protected onLoad(): void {
        this.m_rigidbody = this.getComponent(RigidBody2D);
        this.m_state = this.getComponent(StateBase);

        if (this.m_state != null)
            this.node.on(ConstantBase.NODE_STATE, this.onState, this);

        let colliders = this.getComponents(Collider2D);
        for (let i = 0; i < colliders.length; i++) {
            let collider = colliders[i];
            switch (collider.tag) {
                case this.TagPlatform:
                    this.m_colliderPlatform = collider;
                    break;
                case this.TagCheck:
                    this.m_colliderCheck = collider;
                    break;
                default:
                    continue;
            }
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            if (this.StayContact) {
                if (VERSION < '3.7.1')
                    //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                    collider.on(Contact2DType.POST_SOLVE, this.onStayContact, this); //Called after each Physic system caculated
            }
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        };
    }

    protected start(): void {
        this.m_colliderPlatform.sensor = false;
        this.m_colliderPlatform.enabled = false;
        //If Platform Collider Check is BoxCollider2D, it size of Y should be atleast 50 to avoid physic bug
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagPlatform:
                //console.log('platform on platform: ' + otherCollider.node.name);
                break;
            case this.TagCheck:
                if (!this.getState())
                    break;
                switch (otherCollider.tag) {
                    case this.TagPlayerBot:
                        let playerWorldPosY = otherCollider.worldAABB.center.clone().y;
                        this.m_colliderPlatform.enabled = playerWorldPosY > this.m_checkWorldPosY;
                        //Used enable without sensor to avoid bug when used apply() methode
                        if (VERSION >= '3.7.1') {
                            //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                            this.m_colliderStaySchedule = this.schedule(() => {
                                if (this.m_rigidbody != null ? !this.m_rigidbody.isValid : true) {
                                    this.unschedule(this.m_colliderStaySchedule);
                                    return;
                                }
                                let playerWorldPosY = otherCollider.worldAABB.center.clone().y;
                                this.m_colliderPlatform.enabled = playerWorldPosY > this.m_checkWorldPosY;
                                if (playerWorldPosY > this.m_checkWorldPosY)
                                    this.unschedule(this.m_colliderStaySchedule);
                            }, PhysicsSystem2D.instance.fixedTimeStep, macro.REPEAT_FOREVER, 0);
                        }
                        break;
                }
                break;
        }
    }

    protected onStayContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagPlatform:
                break;
            case this.TagCheck:
                if (!this.getState())
                    break;
                switch (otherCollider.tag) {
                    case this.TagPlayerBot:
                        let playerWorldPosY = otherCollider.worldAABB.center.clone().y;
                        this.m_colliderPlatform.enabled = playerWorldPosY > this.m_checkWorldPosY;
                        //Used enable without sensor to avoid bug when used apply() methode
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagPlatform:
                //console.log('platform off platform: ' + otherCollider.node.name);
                break;
            case this.TagCheck:
                if (!this.getState())
                    break;
                switch (otherCollider.tag) {
                    case this.TagPlayerBot:
                        this.m_colliderPlatform.enabled = false;
                        //Used enable without sensor to avoid bug when used apply() methode
                        if (VERSION >= '3.7.1')
                            //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                            this.unschedule(this.m_colliderStaySchedule);
                        break;
                }
                break;
        }
    }

    private onState(state: boolean) {
        if (!state)
            //When state value set to OFF, collider of platform will disable
            this.m_colliderPlatform.enabled = false;
    }

    private getState(): boolean {
        return this.m_state != null ? this.m_state.State : true;
    }
}