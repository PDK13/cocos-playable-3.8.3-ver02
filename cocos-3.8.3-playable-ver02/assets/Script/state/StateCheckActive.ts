import { _decorator, Component, Node } from 'cc';
import { StateBase } from './StateBase';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateCheckActive')
@requireComponent(StateBase)
export class StateCheckActive extends Component {

    @property([Node])
    NodeStateOn: Node[] = [];

    @property([Node])
    NodeStateOff: Node[] = [];

    m_state: StateBase = null;

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        this.node.on(ConstantBase.ON_NODE_STATE, this.onStateActive, this);
    }

    protected start(): void {
        this.onStateActive();
    }

    private onStateActive() {
        this.NodeStateOn.forEach(node => {
            node.active = this.m_state.State;
        });
        this.NodeStateOff.forEach(node => {
            node.active = !this.m_state.State;
        });
    }
}