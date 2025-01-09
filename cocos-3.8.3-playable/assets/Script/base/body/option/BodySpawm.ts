import { _decorator, CCFloat, CCString, Component, ERigidBody2DType, instantiate, Node, RigidBody2D, tween, TweenEasing, v2, v3, Vec2, Vec3 } from 'cc';
import { EaseType } from '../../BaseConstant';
const { ccclass, property } = _decorator;

@ccclass('BodySpawm')
export class BodySpawm extends Component {

    @property({ group: { name: 'Spawm' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Spawm' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Spawm' }, type: EaseType })
    Ease: EaseType = EaseType.linear;
    @property({ group: { name: 'Spawm' }, type: Vec2 })
    Offset: Vec2 = v2();
    @property({ group: { name: 'Spawm' }, type: Node })
    Effect: Node = null;
    @property({ group: { name: 'Spawm' }, type: Node })
    Spawm: Node = null;

    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_rigidbody = this.getComponent(RigidBody2D);
    }

    protected start(): void {
        if (this.Spawm == null)
            this.Spawm = this.node.parent;
    }

    onInit() {
        if (this.m_rigidbody != null)
            this.scheduleOnce(() => this.m_rigidbody.enabled = false, 0.02);
        let scalePrimary = this.node.scale.clone();
        let posPrimary = this.node.position.clone();
        let posStart = posPrimary.clone().add(v3(this.Offset.x, this.Offset.y, 0)).clone();
        this.node.setScale(Vec3.ZERO);
        this.node.position = posStart;
        tween(this.node)
            .delay((this.m_rigidbody != null ? 0.02 : 0) + this.Delay)
            .to(this.Duration, { position: posPrimary, scale: scalePrimary }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => {
                if (this.m_rigidbody != null)
                    this.scheduleOnce(() => this.m_rigidbody.enabled = true, 0.02);
            })
            .start();
        //
        let effect = instantiate(this.Effect);
        effect.setParent(this.Spawm);
        effect.position = posStart;
        effect.active = true;
    }
}