import { _decorator, Node, CCBoolean, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, RigidBody2D, tween, Vec3 } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

export enum PressType {
    Hold,
    Toggle,
};
Enum(PressType);

@ccclass('StateTriggerPress')
@requireComponent(StateBase)
@requireComponent(RigidBody2D)
export class StateTriggerPress extends Component {

    @property({ group: { name: 'Main' }, type: PressType })
    Type: PressType = PressType.Hold;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Fall: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;

    @property({ group: { name: 'Object' }, type: Node })
    Node: Node = null;
    @property({ group: { name: 'Object' }, type: CCFloat, visible(this: StateTriggerPress) { return this.Node != null; } })
    TweenOffsetY: number = -20;
    @property({ group: { name: 'Object' }, type: CCFloat, visible(this: StateTriggerPress) { return this.Node != null; } })
    TweenDuration: number = 0.2;

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    m_count: number = 0;

    m_startY: number;
    m_endY: number;

    m_state: StateBase = null;

    //

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (collider.tag == this.TagBody) {
                switch (this.Type) {
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

        switch (this.Type) {
            case PressType.Hold:
                //State value start OFF on current object
                this.m_state.State = false;
                break;
            case PressType.Toggle:
                //State value keep on current object(s)
                break;
        }

        if (this.Node != null)
            this.node.on(ConstantBase.NODE_STATE, this.onStateSprite, this);
    }

    protected start(): void {
        this.m_startY = this.Node.position.clone().y;
        this.m_endY = this.m_startY + this.TweenOffsetY;
        if (this.Node != null)
            this.onStateSpriteInit();
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.sensor)
            return;
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex > -1) {
            if (this.Fall) {
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
        switch (this.Type) {
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

        if (this.Once) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                if (collider.tag == this.TagBody) {
                    switch (this.Type) {
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
        switch (this.Type) {
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

    //

    private onStateSprite() {
        if (this.m_state.State) {
            let posTo = Vec3.UP.clone().multiplyScalar(this.m_endY);
            tween(this.Node)
                .to(this.TweenDuration, { position: posTo }, { easing: 'linear' })
                .start();
        }
        else {
            let posTo = Vec3.UP.clone().multiplyScalar(this.m_startY);
            tween(this.Node)
                .to(this.TweenDuration, { position: posTo }, { easing: 'linear' })
                .start();
        }
    }

    private onStateSpriteInit() {
        if (this.m_state.State) {
            let posTo = Vec3.UP.clone().multiplyScalar(this.m_endY);
            this.Node.position = posTo;
        }
        else {
            let posTo = Vec3.UP.clone().multiplyScalar(this.m_startY);
            this.Node.position = posTo;
        }
    }
}