import { _decorator, CCInteger, Collider2D, Component, RigidBody2D } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateOnCollider')
@requireComponent(StateBase)
@requireComponent(RigidBody2D)
export class StateOnCollider extends Component {

    //@property({ type: CCBoolean, visible(this: StateOnCollider) { return this.getComponent(StateBase) == null; } })
    State: boolean = true;

    @property(CCInteger)
    TagBody: number = 0;

    m_collider: Collider2D[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_STATE, this.onStateCollider, this);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (collider.tag == this.TagBody)
                this.m_collider.push(collider);
        });
    }

    protected start(): void {
        let stateBase = this.getComponent(StateBase);
        this.onStateCollider(stateBase != null ? stateBase.State : this.State);
    }

    private onStateCollider(state: boolean) {
        this.m_collider.forEach(collider => {
            collider.enabled = state;
        });
    }
}