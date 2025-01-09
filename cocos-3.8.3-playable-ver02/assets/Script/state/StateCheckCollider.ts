import { _decorator, CCInteger, Collider2D, Component, RigidBody2D } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateCheckCollider')
@requireComponent(StateBase)
@requireComponent(RigidBody2D)
export class StateCheckCollider extends Component {

    //@property({ group: { name: 'Self' }, type: CCInteger })
    @property(CCInteger)
    TagBody: number = 0;

    m_collider: Collider2D[] = [];

    m_state: StateBase = null;

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        this.node.on(ConstantBase.ON_NODE_STATE, this.onStateCollider, this);

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