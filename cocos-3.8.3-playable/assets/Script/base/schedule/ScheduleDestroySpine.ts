import { _decorator, CCBoolean, CCFloat, CCString, Component, math, sp } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property } = _decorator;

@ccclass('ScheduleDestroySpine')
export class ScheduleDestroySpine extends Component {

    @property(SpineBase)
    Spine: SpineBase = null;

    @property({ group: { name: 'Schedule' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Schedule' }, type: CCFloat })
    Exist: number = 5;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimStart: string = 'start';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimNormalLoop: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimNormal: string = 'normal';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimEnd: string = 'end';

    m_animDuration: number = 0;

    protected start(): void {
        if (this.Spine == null)
            this.Spine = this.getComponent(SpineBase);
        this.scheduleOnce(() => this.onProgess(), this.Delay);
    }

    private onProgess() {
        this.m_animDuration = this.Spine.onAnimation(this.AnimStart, false, true); //Anim Start
        this.scheduleOnce(() => {
            this.m_animDuration = this.Spine.onAnimation(this.AnimNormal, this.AnimNormalLoop); //Anim Normal
            this.scheduleOnce(() => this.onProgessDestroy(), this.Exist);
        }, this.m_animDuration);
    }

    private onProgessDestroy() {
        this.m_animDuration = this.Spine.onAnimation(this.AnimEnd, false, true); //Anim End
        this.scheduleOnce(() => {
            this.scheduleOnce(() => this.node.destroy(), 0.02);
        }, this.m_animDuration);
    }
}