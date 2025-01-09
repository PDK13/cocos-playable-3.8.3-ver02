import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiPopup')
export class UiPopup extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCFloat, visible(this: UiPopup) { return this.Start; } })
    DelayStart: number = 15;
    @property({ group: { name: 'Event' }, type: CCString })
    OnPopup: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 2;

    @property({ group: { name: 'Popup' }, type: Node })
    Mask: Node = null;
    @property({ group: { name: 'Popup' }, type: Node })
    Panel: Node = null;

    m_active: boolean = false;

    protected onLoad(): void {
        if (this.OnPopup != '')
            this.scheduleOnce(() => director.on(this.OnPopup, this.onPopup, this), this.DelayStart);
    }

    protected start(): void {
        this.Mask.active = false;
        this.Panel.active = false;
        this.Panel.scale = Vec3.ZERO;

        if (this.Start)
            this.onPopup()
    }

    onPopup() {
        if (this.m_active)
            return;
        this.m_active = true;
        this.scheduleOnce(() => {
            this.Mask.active = true;
            this.Panel.active = true;
        }, this.Delay);
        director.off(this.OnPopup, this.onPopup, this);
    }
}