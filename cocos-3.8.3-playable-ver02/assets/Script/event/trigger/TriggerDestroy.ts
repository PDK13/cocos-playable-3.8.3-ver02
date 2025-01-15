import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { ConstantBase } from '../../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('TriggerDestroy')
export class TriggerDestroy extends Component {

    @property({ group: { name: 'Main' }, type: Node })
    Target: Node[] = [];
    @property({ group: { name: 'Main' }, type: CCBoolean })
    TargetSelf: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    TargetContact: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    OnNode: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Main' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 0;
    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagTarget: number[] = [100];

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(collider => {
            switch (collider.tag) {
                case this.TagBody:
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    break;
            }
        });
        if (this.OnNode)
            this.node.on(ConstantBase.NODE_EVENT, this.onEvent, this);
    }

    protected start(): void {
        if (this.Target.length == 0)
            this.Target.push(this.node);
    }

    onEvent() {
        this.Target = this.Target.filter(t => t == null);
        this.Target.forEach(target => {
            this.onEventSingle(target);
        });
        this.Target = this.Target.filter(t => t == null);
    }

    onEventSingle(target: Node) {
        if (target == null ? true : !target.isValid)
            return;
        target.destroy();
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let targetIndex = this.TagTarget.findIndex((t) => t == otherCollider.tag);
        if (targetIndex < 0)
            return;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.onEvent();
            if (this.TargetSelf)
                this.onEventSingle(this.node);
            if (this.TargetContact)
                this.onEventSingle(otherCollider.node);
        }, Math.max(this.Delay, 0));
        if (this.Once) {
            let colliders = this.getComponents(Collider2D);
            colliders.forEach(collider => {
                switch (collider.tag) {
                    case this.TagBody:
                        collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                        break;
                }
            });
        }
    }
}