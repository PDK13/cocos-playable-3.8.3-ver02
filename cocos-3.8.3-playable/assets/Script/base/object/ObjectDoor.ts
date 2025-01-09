import { _decorator, CCBoolean, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, macro, PhysicsSystem2D, VERSION } from 'cc';
import { BaseConstant } from '../BaseConstant';
const { ccclass, property } = _decorator;

@ccclass('ObjectDoor')
export class ObjectDoor extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    StayContact: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    TriggerOnce: boolean = false;
    @property({ group: { name: 'Main' }, type: CCString })
    EmitTrigger: string = BaseConstant.PLAYER_COMPLETE;

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagBody: number = 0;

    @property({ group: { name: 'Other' }, type: CCInteger })
    TagTarget: number = 100;

    m_colliderStaySchedule: Function = null; //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
    m_ready: boolean = true;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (collider.tag == this.TagBody) {
                collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                if (this.StayContact && VERSION < '3.7.1')
                    //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                    collider.on(Contact2DType.POST_SOLVE, this.onStayContact, this);
                collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        });
        if (VERSION >= '3.7.1') {
            this.m_colliderStaySchedule = () => {
                if (this.onTrigger())
                    this.unschedule(this.m_colliderStaySchedule);
            }
        }
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        if (this.StayContact && VERSION >= '3.7.1') {
                            //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                            if (!this.onTrigger())
                                this.schedule(this.m_colliderStaySchedule, PhysicsSystem2D.instance.fixedTimeStep, macro.REPEAT_FOREVER, 0);
                        }
                        else
                            this.onTrigger();
                        break;
                }
                break;
        }
    }

    protected onStayContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        this.onTrigger();
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        if (this.StayContact && VERSION >= '3.7.1')
                            //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                            this.unschedule(this.m_colliderStaySchedule);
                        break;
                }
                break;
        }
    }

    private onTrigger(): boolean {
        if (this.m_ready) {
            if (this.EmitTrigger != '')
                director.emit(this.EmitTrigger);
            if (this.TriggerOnce) {
                let colliders = this.getComponents(Collider2D);
                colliders.forEach(collider => {
                    if (collider.tag == this.TagBody) {
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        if (this.StayContact && VERSION < '3.7.1')
                            //Contact2DType.PRE_SOLVE and Contact2DType.POST_SOLVE are deprecated since v3.7.1
                            collider.off(Contact2DType.POST_SOLVE, this.onStayContact, this);
                        collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
                    }
                });
            }
            return true;
        }
        return false;
    }
}