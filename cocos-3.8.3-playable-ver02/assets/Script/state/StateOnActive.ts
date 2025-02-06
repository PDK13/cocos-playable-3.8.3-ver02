import { _decorator, CCBoolean, CCFloat, Component, Node } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateOnActive')
@requireComponent(StateBase)
export class StateOnActive extends Component {

    @property({ type: CCBoolean, visible(this: StateOnActive) { return this.getComponent(StateBase) == null; } })
    State: boolean = true;

    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;

    @property({ group: { name: 'Target' }, type: [Node] })
    TargetOn: Node[] = [];
    @property({ group: { name: 'Target' }, type: [Node] })
    TargetOff: Node[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_STATE, this.onStateActive, this);
    }

    protected start(): void {
        let stateBase = this.getComponent(StateBase);
        this.onStateActive(stateBase != null ? stateBase.State : this.State);
    }

    private onStateActive(state: boolean) {
        this.TargetOn.forEach(node => {
            node.active = state;
        });
        this.TargetOff.forEach(node => {
            node.active = !state;
        });
    }
}