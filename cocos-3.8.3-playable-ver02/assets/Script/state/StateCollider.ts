import { _decorator, CCInteger, Collider2D, Component, RigidBody2D } from 'cc';
import { StateBase } from './StateBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateCollider')
@requireComponent(StateBase)
@requireComponent(RigidBody2D)
export class StateCollider extends Component {

    //@property({ group: { name: 'Self' }, type: CCInteger })
    @property(CCInteger)
    TagBody: number = 0;

    m_collider: Collider2D[] = [];

    m_state: StateBase = null;

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        this.node.on(this.m_state.m_emitState, this.onStateCollider, this);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (collider.tag == this.TagBody)
                this.m_collider.push(collider);
        });
    }

    protected start(): void {
        this.onStateCollider();
    }

    private onStateCollider() {
        this.m_collider.forEach(collider => {
            collider.enabled = this.m_state.State;
        });
    }
}