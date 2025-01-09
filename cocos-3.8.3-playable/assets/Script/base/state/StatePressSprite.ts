import { _decorator, CCFloat, Component, Node, tween, Vec3 } from 'cc';
import { StateBase } from './StateBase';
import { StatePress } from './StatePress';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('StatePressSprite')
@requireComponent(StatePress)
export class StatePressSprite extends Component {

    //@property({ group: { name: 'Main' }, type: Node })
    @property(Node)
    Node: Node = null;
    //@property({ group: { name: 'Main' }, type: CCFloat })
    @property(CCFloat)
    TweenOffsetY: number = -20;
    //@property({ group: { name: 'Main' }, type: CCFloat })
    @property(CCFloat)
    TweenDuration: number = 0.2;

    m_startY: number;
    m_endY: number;

    m_state: StateBase = null;

    protected onLoad(): void {
        this.m_state = this.getComponent(StateBase);

        if (this.Node != null)
            this.node.on(this.m_state.m_emitState, this.onStateSprite, this);
    }

    protected start(): void {
        this.m_startY = this.Node.position.clone().y;
        this.m_endY = this.m_startY + this.TweenOffsetY;
        if (this.Node != null)
            this.onStateSpriteInit();
    }

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