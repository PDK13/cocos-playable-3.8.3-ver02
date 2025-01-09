import { _decorator, Camera, CCBoolean, CCFloat, CCString, Component, director, Enum, EventTouch, Node, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { UIScroll } from './UIScroll';
const { ccclass, property, requireComponent } = _decorator;

export enum ScrollPressType {
    NONE,
    NAME_OF_ITEM,
    NAME_OF_CONTENT,
    NAME_OF_SCROLL,
    CUSTOM,
}
Enum(ScrollPressType);

export enum ScrollPressCustomType {
    NONE,
    NODE,
}
Enum(ScrollPressCustomType);

@ccclass('UiScrollDrag')
export class UiScrollDrag extends Component {

    //@property({ group: { name: 'Init' }, type: UIScroll })
    @property({ type: UIScroll })
    Scroll: UIScroll = null;

    @property({ group: { name: 'Slide' }, type: CCFloat })
    SlideDistance: number = 50;
    @property({ group: { name: 'Slide' }, type: CCBoolean })
    SlideOnce: boolean = false;

    @property({ group: { name: 'Press' }, type: CCBoolean })
    PressOnce: boolean = false;
    @property({ group: { name: 'Press' }, type: CCFloat })
    PressDelay: number = 0;
    @property({ group: { name: 'Press' }, type: ScrollPressType })
    PressType: ScrollPressType = ScrollPressType.NONE;
    @property({ group: { name: 'Press' }, type: CCString })
    PressCustom: string = "";
    @property({ group: { name: 'Press' }, type: ScrollPressCustomType })
    PressCustomType: ScrollPressCustomType = ScrollPressCustomType.NONE;;

    @property({ group: { name: 'Init' }, type: Camera })
    UiCamera: Camera = null;

    m_posTouched: Vec3 = v3();
    m_posLocked: Vec3 = v3();
    m_direction: Vec2 = v2();
    m_drag: boolean = false;
    m_lock: boolean = false;

    m_uiTransform: UITransform = null;

    protected onLoad(): void {
        this.m_uiTransform = this.node.getComponent(UITransform);

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        let tempW3 = v3();
        this.UiCamera.screenToWorld(tempV3, tempW3);

        this.m_posTouched = this.m_uiTransform?.convertToNodeSpaceAR(tempW3);
        this.m_posTouched.z = 0;

        this.m_posLocked = this.m_posTouched;

        this.m_drag = false;
        this.m_lock = false;
        this.m_direction = Vec2.ZERO.clone();
    }

    onTouchMove(event: EventTouch) {
        if (this.m_lock)
            return;

        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        let tempW3 = v3();
        this.UiCamera.screenToWorld(tempV3, tempW3);

        this.m_posTouched = this.m_uiTransform?.convertToNodeSpaceAR(tempW3);
        this.m_posTouched.z = 0;

        this.m_drag = true;
        this.m_lock = this.SlideOnce ? true : false;
        let direction = this.m_posTouched.clone().subtract(this.m_posLocked).normalize();
        this.m_direction = v2(direction.clone().x, direction.clone().y);

        let distance = this.m_posTouched.clone().subtract(this.m_posLocked).length();
        if (distance >= this.SlideDistance) {
            this.m_posLocked = this.m_posTouched;
            if (this.m_direction.x > 0)
                this.Scroll.onScrollRight();
            else
                this.Scroll.onScrollLeft();
        }
    }

    onTouchEnd(event: EventTouch) {
        if (!this.m_drag) {
            if (this.PressType != ScrollPressType.NONE) {
                let emitPress = "";
                switch (this.PressType) {
                    case ScrollPressType.NAME_OF_ITEM:
                        emitPress = this.Scroll.getCentre().name;
                        break;
                    case ScrollPressType.NAME_OF_CONTENT:
                        emitPress = this.Scroll.Content.name;
                        break;
                    case ScrollPressType.NAME_OF_SCROLL:
                        emitPress = this.Scroll.node.name;
                        break;
                    case ScrollPressType.CUSTOM:
                        emitPress = this.PressCustom;
                        break;
                }
                this.scheduleOnce(() => {
                    switch (this.PressCustomType) {
                        case ScrollPressCustomType.NONE:
                            director.emit(emitPress);
                            break;
                        case ScrollPressCustomType.NODE:
                            director.emit(emitPress, this.Scroll.getCentre());
                            break;
                    }
                }, this.PressDelay);
            }
            if (this.PressOnce) {
                this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
                this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
                this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            }
        }
        this.m_drag = false;
        this.m_lock = false;
        this.m_direction = Vec2.ZERO.clone();
    }
}