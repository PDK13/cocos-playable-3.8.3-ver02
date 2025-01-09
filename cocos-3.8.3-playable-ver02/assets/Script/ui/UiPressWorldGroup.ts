import { _decorator, Camera, CCBoolean, CCFloat, CCString, Component, director, Enum, EventTouch, Input, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum EmitEventType {
    FULL,
    PRESS,
    RELEASE,
}
Enum(EmitEventType);

@ccclass('UiPressWorldGroup')
export class UiPressWorldGroup extends Component {

    @property([Node])
    Group: Node[] = [];

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
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

    m_pressScreenPos: Vec2 = new Vec2();
    m_pressScreenPos3D: Vec3 = new Vec3();
    m_pressWorldSpace: Vec3 = new Vec3();

    m_releaseScreenPos: Vec2 = new Vec2();
    m_releaseScreenPos3D: Vec3 = new Vec3();
    m_releaseWorldSpace: Vec3 = new Vec3();

    m_pressTarget: Node[] = [];

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onPressStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onPressEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onPressEnd, this);
    }

    onPressStart(event: EventTouch) {
        if (!this.Camera.enabledInHierarchy || this.m_press)
            return;
        this.m_pressScreenPos = event.getLocation().clone();
        this.m_pressScreenPos3D = new Vec3();
        this.m_pressScreenPos3D.x = this.m_pressScreenPos.x;
        this.m_pressScreenPos3D.y = this.m_pressScreenPos.y;
        this.Camera.screenToWorld(this.m_pressScreenPos3D, this.m_pressWorldSpace);
        for (let i = 0; i < this.Group.length; i++) {
            for (let j = 0; j < this.Group[i].children.length; j++) {
                if (this.m_pressWorldSpace.x < this.Group[i].children[j].worldPosition.x + this.Limit &&
                    this.m_pressWorldSpace.y < this.Group[i].children[j].worldPosition.y + this.Limit &&
                    this.m_pressWorldSpace.x > this.Group[i].children[j].worldPosition.x - this.Limit &&
                    this.m_pressWorldSpace.y > this.Group[i].children[j].worldPosition.y - this.Limit) { //Dont use foreach because it's can't break!
                    //
                    this.m_press = true;
                    this.m_pressTarget.push(this.Group[i].children[j]);
                    if (this.EmitType == EmitEventType.FULL || this.EmitType == EmitEventType.PRESS) {
                        if (this.EmitEvent != '') {
                            if (this.EmitTarget)
                                director.emit(this.EmitEvent, true, this.Group[i].children[j]);
                            else
                                director.emit(this.EmitEvent, true);
                        }
                    }
                    if (this.EmitOnce)
                        break;
                    //
                }
            }
        }
        if (this.Once) {
            this.node.off(Input.EventType.TOUCH_START, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_END, this.onPressStart, this);
            this.node.off(Input.EventType.TOUCH_CANCEL, this.onPressStart, this);
        }
    }

    onPressEnd(event: EventTouch) {
        this.m_press = false;
        this.m_releaseScreenPos = event.getLocation().clone();
        this.m_releaseScreenPos3D = new Vec3();
        this.m_releaseScreenPos3D.x = this.m_pressScreenPos.x;
        this.m_releaseScreenPos3D.y = this.m_pressScreenPos.y;
        this.Camera.screenToWorld(this.m_releaseScreenPos3D, this.m_releaseWorldSpace);
        if (this.EmitType == EmitEventType.FULL || this.EmitType == EmitEventType.RELEASE) {
            if (this.EmitEvent != '') {
                for (let i = 0; i < this.m_pressTarget.length; i++) {
                    if (this.EmitTarget)
                        director.emit(this.EmitEvent, false, this.m_pressTarget[i]);
                    else
                        director.emit(this.EmitEvent, false);
                }
            }
        }
        this.m_pressTarget.splice(0, this.m_pressTarget.length);
    }
}