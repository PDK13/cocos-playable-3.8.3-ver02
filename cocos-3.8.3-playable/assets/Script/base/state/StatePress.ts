import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, RigidBody2D, Vec3 } from 'cc';
import { StateBase } from './StateBase';
const { ccclass, property, requireComponent } = _decorator;

export enum PressType {
    Hold,
    Toggle,
};
Enum(PressType);

@ccclass('StatePress')
@requireComponent(StateBase)
@requireComponent(RigidBody2D)
export class StatePress extends Component {

    @property({ group: { name: 'Main' }, type: PressType })
    PressType: PressType = PressType.Hold;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    FallTrigger: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    OnceTrigger: boolean = false;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_count: number = 0;
    
    m_state: StateBase = null;

    //

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (collider.tag == this.TagBody) {
                switch (this.PressType) {
                    case PressType.Hold:
                        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                        break;
                    case PressType.Toggle:
                        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            }
        });

        switch (this.PressType) {
            case PressType.Hold:
                //State value start OFF on current object
                this.m_state.State = false;
                break;
            case PressType.Toggle:
                //State value keep on current object(s)
                break;
        }
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.sensor)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (this.FallTrigger) {
                let targetRigidbodyY = (otherCollider.body.linearVelocity ?? Vec3.ZERO).clone().y;
                if (targetRigidbodyY <= -0.02)
                    this.onStateUpdate();
            }
            else
                this.onStateUpdate();
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.sensor)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1)
            this.onStateRemove();
    }

    //

    onStateUpdate() {
        switch (this.PressType) {
            case PressType.Hold:
                this.m_count++;
                if (this.m_count > 1)
                    break;
                this.m_state.onState(true);
                break;
            case PressType.Toggle:
                if (this.m_state.State)
                    break;
                this.m_state.onState(true);
                break;
        }

        if (this.OnceTrigger) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                if (collider.tag == this.TagBody) {
                    switch (this.PressType) {
                        case PressType.Hold:
                            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
                            break;
                        case PressType.Toggle:
                            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                            break;
                    }
                }
            });
        }
    }

    onStateRemove() {
        switch (this.PressType) {
            case PressType.Hold:
                this.m_count--;
                if (this.m_count > 0)
                    break;
                this.m_state.onState(false);
                break;
            case PressType.Toggle:
                //Not press off after pressed on, wait until state value is OFF (false)
                break;
        }
    }
}