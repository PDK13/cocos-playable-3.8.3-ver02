import { _decorator, Camera, Component, Input, Node, Vec2, EventTouch, Vec3, CCFloat, CCString, director, CCBoolean, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum EmitEventType {
    FULL,
    PRESS,
    RELEASE,
}
Enum(EmitEventType);

@ccclass('UiPressWorld')
export class UiPressWorld extends Component {

    @property([Node])
    Target: Node[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';
    @property({ group: { name: 'Event' }, type: EmitEventType })
    EmitType: EmitEventType = EmitEventType.FULL;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitOnce: boolean = true;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitTarget: boolean = false;

    @property({ group: { name: 'Press' }, type: CCFloat })
    Limit: number = 200;
    @property({ group: { name: 'Press' }, type: Camera })
    Camera: Camera = null;
    @property({ group: { name: 'Press' }, type: Node })
    Canvas: Node = null;

    m_press: boolean = false;
    m_posPressWorld: Vec3 = new Vec3();
    m_posReleaseWorld: Vec3 = new Vec3();
    m_targetPressed: Node[] = [];

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onPressStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onPressEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
    }

    onPressStart(event: EventTouch) {
        if (!this.Camera.enabledInHierarchy || this.m_press)
            return;

        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        this.Camera.screenToWorld(tempV3, this.m_posPressWorld);

        for (let i = 0; i < this.Target.length; i++) {
            if (this.m_posPressWorld.x < this.Target[i].worldPosition.x + this.Limit &&
                this.m_posPressWorld.y < this.Target[i].worldPosition.y + this.Limit &&
                this.m_posPressWorld.x > this.Target[i].worldPosition.x - this.Limit &&
                this.m_posPressWorld.y > this.Target[i].worldPosition.y - this.Limit) { //Dont use foreach because it's can't break!
                //
                this.m_press = true;
                this.m_targetPressed.push(this.Target[i]);
                if (this.EmitType == EmitEventType.FULL || this.EmitType == EmitEventType.PRESS) {
                    if (this.EmitEvent != '') {
                        if (this.EmitTarget)
                            director.emit(this.EmitEvent, true, this.Target[i]);
                        else
                            director.emit(this.EmitEvent, true);
                    }
                }
                if (this.EmitOnce)
                    break;
                //
            }
        }

        if (this.OnceTrigger) {
            this.node.off(Input.EventType.TOUCH_START, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_END, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_CANCEL, this.onPressStart, this);
        }
    }

    onPressEnd(event: EventTouch) {
        if (!this.m_press)
            return;
        this.m_press = false;

        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        this.Camera.screenToWorld(tempV3, this.m_posReleaseWorld);

        if (this.EmitType == EmitEventType.FULL || this.EmitType == EmitEventType.RELEASE) {
            if (this.EmitEvent != '') {
                for (let i = 0; i < this.m_targetPressed.length; i++) {
                    if (this.EmitTarget)
                        director.emit(this.EmitEvent, false, this.m_targetPressed[i]);
                    else
                        director.emit(this.EmitEvent, false);
                }
            }
        }
        this.m_targetPressed.splice(0, this.m_targetPressed.length);
    }
}