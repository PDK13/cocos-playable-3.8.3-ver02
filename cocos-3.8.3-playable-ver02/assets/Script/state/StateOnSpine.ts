import { _decorator, CCBoolean, CCFloat, CCString, Component, Node, sp } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { StateBase } from './StateBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StateOnSpine')
@requireComponent(StateBase)
export class StateOnSpine extends Component {

    @property({ type: CCBoolean, visible(this: StateOnSpine) { return this.getComponent(StateBase) == null; } })
    State: boolean = true;

    @property({ type: sp.Skeleton })
    Spine: sp.Skeleton = null;

    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimOn: string = '';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimOnLoop: boolean = true;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimOff: string = '';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimOffLoop: boolean = true;

    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_STATE, this.onStateActive, this);
    }

    protected start(): void {
        let stateBase = this.getComponent(StateBase);
        this.onStateActive(stateBase != null ? stateBase.State : this.State);
    }

    private onStateActive(state: boolean) {
        this.scheduleOnce(() => {
            if (state)
                this.Spine.setAnimation(0, this.AnimOn, this.AnimOnLoop);
            else
                this.Spine.setAnimation(0, this.AnimOff, this.AnimOffLoop);
        }, Math.max(this.Delay, 0));
    }
}