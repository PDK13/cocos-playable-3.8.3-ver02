import { _decorator, CCBoolean, Component, Node } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateOnActive')
@requireComponent(StateBase)
export class StateOnActive extends Component {

    //@property({ type: CCBoolean, visible(this: StateOnActive) { return this.getComponent(StateBase) == null; } })
    State: boolean = true;

    @property([Node])
    NodeStateOn: Node[] = [];

    @property([Node])
    NodeStateOff: Node[] = [];

    protected onLoad(): void {
        this.node.on(ConstantBase.ON_NODE_STATE, this.onStateActive, this);
    }

    protected start(): void {
        let stateBase = this.getComponent(StateBase);
        this.onStateActive(stateBase != null ? stateBase.State : this.State);
    }

    private onStateActive(state: boolean) {
        this.NodeStateOn.forEach(node => {
            node.active = state;
        });
        this.NodeStateOff.forEach(node => {
            node.active = !state;
        });
    }
}