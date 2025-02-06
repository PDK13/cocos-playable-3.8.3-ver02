import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, RigidBody2D } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('StateOnCollider')
export class StateOnCollider extends Component {

    @property({ type: CCBoolean, visible(this: StateOnCollider) { return this.getComponent(StateBase) == null; } })
    State: boolean = true;

    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;

    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagBody: number[] = [];

    m_collider: Collider2D[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_STATE, this.onStateCollider, this);

        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            if (this.TagBody.findIndex(t => t == collider.tag) >= 0)
                this.m_collider.push(collider);
        });
    }

    protected start(): void {
        let stateBase = this.getComponent(StateBase);
        this.onStateCollider(stateBase != null ? stateBase.State : this.State);
    }

    private onStateCollider(state: boolean) {
        this.scheduleOnce(() => {
            this.m_collider.forEach(collider => {
                collider.enabled = state;
            });
        }, Math.max(this.Delay, 0));
    }
}