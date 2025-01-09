import { _decorator, Camera, CCBoolean, CCFloat, CCString, Component, Enum, EventTouch, Node, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum JoystickType {
    FIXED,
    FOLLOW,
}
Enum(JoystickType);

export enum JoystickLockType {
    NONE,
    LOCKX,
    LOCKY,
    ALL,
}
Enum(JoystickLockType);

@ccclass('UiJoystick')
export class UiJoystick extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Hide: boolean = false;
    @property({ group: { name: 'Main' }, type: JoystickType })
    Type = JoystickType.FIXED;
    @property({ group: { name: 'Main' }, type: JoystickLockType })
    Lock = JoystickLockType.NONE;
    @property({ group: { name: 'Main' }, type: CCFloat })
    RatioOffset: number = 0.75;

    @property({ group: { name: 'Init' }, type: Node })
    Dot: Node = null;
    @property({ group: { name: 'Init' }, type: Node })
    Mask: Node = null;
    @property({ group: { name: 'Init' }, type: Camera })
    UiCamera: Camera = null;

    m_dotRadius: number;
    m_maskRadius: number;
    m_posPrimary: Vec3 = v3();
    m_posTouched: Vec3 = v3();
    m_posTouchedFixed: Vec3 = v3();
    m_posLocked: Vec3 = v3();
    m_posDot: Vec3 = v3();
    m_direction: Vec2 = v2();
    m_opacity: number;

    m_uiTransform: UITransform = null;
    m_uiOpacity: UIOpacity = null;

    protected onLoad(): void {
        this.m_uiTransform = this.node.getComponent(UITransform);
        this.m_uiOpacity = this.node.getComponent(UIOpacity);

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected start(): void {
        let dotSize = this.Dot.getComponent(UITransform).contentSize;
        this.m_dotRadius = Math.max(dotSize.x, dotSize.y) / 2;
        let maskSize = this.Mask.getComponent(UITransform).contentSize;
        this.m_maskRadius = Math.max(maskSize.x, maskSize.y) / 2 - this.m_dotRadius;
        this.m_posPrimary = this.Dot.getPosition();
        this.m_opacity = this.m_uiOpacity.opacity;

        if (this.Hide)
            this.m_uiOpacity.opacity = 0;
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

        switch (this.Type) {
            case JoystickType.FIXED:
                this.m_posLocked = this.m_posPrimary;
                break;
            case JoystickType.FOLLOW:
                this.m_posLocked = this.m_posTouched;
                break;
        }

        let direction = this.m_posTouched.clone().subtract(this.m_posLocked).normalize();
        this.m_direction = v2(direction.clone().x, direction.clone().y);

        let distance = this.m_posTouched.clone().subtract(this.m_posLocked).length();
        this.m_posTouchedFixed = direction.multiplyScalar(distance > this.m_maskRadius ? this.m_maskRadius : distance);
        this.m_posDot = this.m_posTouchedFixed.clone().add(this.m_posLocked);

        switch (this.Lock) {
            case JoystickLockType.LOCKX:
                this.m_posDot.x = 0;
                this.m_direction.x = 0;
                break;
            case JoystickLockType.LOCKY:
                this.m_posDot.y = 0;
                this.m_direction.y = 0;
                break;
            case JoystickLockType.ALL:
                this.m_posDot.x = 0;
                this.m_posDot.y = 0;
                this.m_direction.x = 0;
                this.m_direction.y = 0;
                break;
        }

        if (1.0 * distance / this.m_maskRadius < 1.0 * this.RatioOffset)
            this.m_direction = Vec2.ZERO.clone();

        this.Dot.position = this.m_posDot;
        this.Mask.position = this.m_posLocked;

        if (this.Hide)
            this.m_uiOpacity.opacity = this.m_opacity;
    }

    onTouchMove(event: EventTouch) {
        let tempV2 = event.getLocation().clone();
        let tempV3 = new Vec3();
        tempV3.x = tempV2.x;
        tempV3.y = tempV2.y;

        let tempW3 = v3();
        this.UiCamera.screenToWorld(tempV3, tempW3);

        this.m_posTouched = this.m_uiTransform?.convertToNodeSpaceAR(tempW3);
        this.m_posTouched.z = 0;

        let direction = this.m_posTouched.clone().subtract(this.m_posLocked).normalize();
        this.m_direction = v2(direction.clone().x, direction.clone().y);

        let distance = this.m_posTouched.clone().subtract(this.m_posLocked).length();
        this.m_posTouchedFixed = direction.multiplyScalar(distance > this.m_maskRadius ? this.m_maskRadius : distance);
        this.m_posDot = this.m_posTouchedFixed.clone().add(this.m_posLocked);

        switch (this.Lock) {
            case JoystickLockType.LOCKX:
                this.m_posDot.x = 0;
                this.m_direction.x = 0;
                break;
            case JoystickLockType.LOCKY:
                this.m_posDot.y = 0;
                this.m_direction.y = 0;
                break;
            case JoystickLockType.ALL:
                this.m_posDot.x = 0;
                this.m_posDot.y = 0;
                this.m_direction.x = 0;
                this.m_direction.y = 0;
                break;
        }

        if (1.0 * distance / this.m_maskRadius < 1.0 * this.RatioOffset)
            this.m_direction = Vec2.ZERO.clone();

        this.Dot.position = this.m_posDot;
        this.Mask.position = this.m_posLocked;
    }

    onTouchEnd(event: EventTouch) {
        this.m_direction = Vec2.ZERO.clone();

        this.m_posTouched = this.m_posPrimary;
        this.m_posLocked = this.m_posPrimary;
        this.m_posDot = this.m_posPrimary;

        this.Dot.position = this.m_posDot;
        this.Mask.position = this.m_posLocked;

        if (this.Hide)
            this.m_uiOpacity.opacity = 0;
    }
}