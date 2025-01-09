import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Label, Node, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueBar')
export class ValueBar extends Component {

    @property({ group: { name: 'Event' }, type: CCString })
    OnUpdate: string = '';

    @property({ group: { name: 'Hide' }, type: CCBoolean })
    Hide: boolean = false;
    @property({ group: { name: 'Hide' }, type: CCFloat })
    HideDelay: number = 3;

    @property({ group: { name: 'Ui' }, type: CCBoolean })
    UiValueFull: boolean = true;
    @property({ group: { name: 'Ui' }, type: CCFloat })
    UiValueMutiMuti: number = 10;
    @property({ group: { name: 'Ui' }, type: Label })
    UiValue: Label = null;
    @property({ group: { name: 'Ui' }, type: Node })
    UiMask: Node = null;
    @property({ group: { name: 'Ui' }, type: Label })
    UiName: Label = null;
    @property({ group: { name: 'Ui' }, type: [Node] })
    UiHide: Node[] = [];

    m_maskSprite: Sprite = null;
    m_maskTransform: UITransform = null;
    m_maskTransformX: number;

    protected onLoad(): void {
        if (this.UiMask != null) {
            this.m_maskSprite = this.UiMask.getComponent(Sprite);
            this.m_maskTransform = this.UiMask.getComponent(UITransform);
        }

        if (this.OnUpdate != '')
            director.on(this.OnUpdate, this.onUpdate, this);
    }

    protected start(): void {
        if (this.UiMask != null)
            this.m_maskTransformX = this.m_maskTransform.contentSize.clone().x;
        if (this.Hide)
            this.onHideNode();
    }

    onName(name: string) {
        if (this.UiName != null)
            this.UiName.string = name;
    }

    onUpdate(current: number, max: number) {
        if (this.Hide) {
            this.unscheduleAllCallbacks();
            this.onShowNode();
            this.scheduleOnce(() => this.onHideNode(), this.HideDelay);
        }
        if (this.UiValue != null) {
            if (this.UiValueFull)
                this.UiValue.string = (current * this.UiValueMutiMuti).toString() + '/' + (max * this.UiValueMutiMuti).toString();
            else
                this.UiValue.string = (current * this.UiValueMutiMuti).toString();
        }
        if (this.UiMask != null) {
            if (this.m_maskSprite != null ? this.m_maskSprite.type == Sprite.Type.FILLED : false)
                this.m_maskSprite.fillRange = 1.0 * current / max;
            else {
                let size = this.m_maskTransform.contentSize.clone();
                size.x = this.m_maskTransformX * (1.0 * current / max);
                this.m_maskTransform.contentSize = size;
            }
        }
    }

    onHideNode() {
        this.UiHide.forEach(nodeCheck => {
            nodeCheck.active = false;
        });
    }

    onShowNode() {
        this.UiHide.forEach(nodeCheck => {
            nodeCheck.active = true;
        });
    }
}