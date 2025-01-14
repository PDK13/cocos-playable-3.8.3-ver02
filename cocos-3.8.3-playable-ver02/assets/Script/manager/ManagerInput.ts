import { _decorator, CCBoolean, CCInteger, Component, director, Enum, EventTouch, input, Input, KeyCode, Label, math, Node, sys, UIOpacity, Vec2 } from 'cc';
import { ManagerEvent } from './ManagerEvent';
import { ConstantBase, KeyCodeType } from '../ConstantBase';
import { UiJoystick } from '../ui/UiJoystick';
const { ccclass, property } = _decorator;

export enum JoyStickDirectionType {
    X,
    Y,
    EIGHT,
}
Enum(JoyStickDirectionType);

@ccclass('ManagerInput')
export class ManagerInput extends Component {

    @property(CCBoolean)
    DirectStore: boolean = false;
    @property(Label)
    DebugUpdate: Label = null;

    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyUp: KeyCodeType = KeyCodeType.ARROW_UP;
    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyDown: KeyCodeType = KeyCodeType.ARROW_DOWN;
    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyLeft: KeyCodeType = KeyCodeType.ARROW_LEFT;
    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyRight: KeyCodeType = KeyCodeType.ARROW_RIGHT;
    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyJump: KeyCodeType = KeyCodeType.SPACE;
    @property({ group: { name: 'Main' }, type: KeyCodeType })
    KeyDash: KeyCodeType = KeyCodeType.KEY_D;

    @property({ group: { name: 'Main' }, type: Node })
    BtnUp: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    BtnDown: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    BtnLeft: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    BtnRight: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    BtnJump: Node = null;
    @property({ group: { name: 'Main' }, type: Node })
    BtnDash: Node = null;

    @property({ group: { name: 'Joystick' }, type: UiJoystick })
    JoyMove: UiJoystick = null;
    @property({ group: { name: 'Joystick' }, type: JoyStickDirectionType })
    JoyMoveType: JoyStickDirectionType = JoyStickDirectionType.EIGHT;

    @property({ group: { name: 'Attack' }, type: KeyCodeType })
    KeyAttack: KeyCodeType = KeyCodeType.KEY_S;
    @property({ group: { name: 'Attack' }, type: CCBoolean })
    AttackUpdate: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean })
    AttackFull: boolean = false;
    @property({ group: { name: 'Attack' }, type: Node })
    BtnAttack: Node = null;

    @property({ group: { name: 'Interaction' }, type: KeyCodeType })
    KeyInteracte: KeyCodeType = KeyCodeType.KEY_A;
    @property({ group: { name: 'Interaction' }, type: Node })
    BtnInteraction: Node = null;
    @property({ group: { name: 'Interaction' }, type: [Node] })
    IconInteraction: Node[] = [];

    @property({ group: { name: 'Switch' }, type: CCBoolean })
    SwitchStart: boolean = true;
    @property({ group: { name: 'Switch' }, type: CCInteger })
    SwitchStartIndex: number = 0;
    @property({ group: { name: 'Switch' }, type: [Node] })
    Switch: Node[] = [];

    @property({ group: { name: 'Other' }, type: [Node] })
    Other: Node[] = [];

    m_lock: boolean = false;
    m_keyboard: boolean = false; //Check if keyboard control without ui control on editor

    get m_avaible(): boolean { return !this.m_lock; }

    m_up: boolean = false;
    m_down: boolean = false;
    m_left: boolean = false;
    m_right: boolean = false;
    m_jump: boolean = false;
    m_attack: boolean = false;

    m_debugDt: number = 0;
    m_debugDtMax: number = 0;
    m_debugDtReset: number = 0;

    protected onLoad(): void {
        director.on(ConstantBase.INPUT_LOCK, this.onLock, this);
        director.on(ConstantBase.INPUT_RESUME, this.onResume, this);

        director.on(ConstantBase.GAME_COMPLETE, this.onLock, this);
        director.on(ConstantBase.GAME_LOSE, this.onLock, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onLock, this);

        if (this.DirectStore || ManagerEvent.Finish)
            return;

        input.on(Input.EventType.KEY_DOWN, this.onKeyPressed, this);
        input.on(Input.EventType.KEY_UP, this.onKeyReleased, this);

        if (this.BtnUp != null) {
            this.BtnUp.on(Input.EventType.TOUCH_START, this.onUpStart, this);
            this.BtnUp.on(Input.EventType.TOUCH_END, this.onUpEnd, this);
            this.BtnUp.on(Input.EventType.TOUCH_CANCEL, this.onUpEnd, this);
        }

        if (this.BtnDown != null) {
            this.BtnDown.on(Input.EventType.TOUCH_START, this.onDownStart, this);
            this.BtnDown.on(Input.EventType.TOUCH_END, this.onDownEnd, this);
            this.BtnDown.on(Input.EventType.TOUCH_CANCEL, this.onDownEnd, this);
        }

        if (this.BtnLeft != null) {
            this.BtnLeft.on(Input.EventType.TOUCH_START, this.onLeftStart, this);
            this.BtnLeft.on(Input.EventType.TOUCH_END, this.onLeftEnd, this);
            this.BtnLeft.on(Input.EventType.TOUCH_CANCEL, this.onLeftEnd, this);
        }

        if (this.BtnRight != null) {
            this.BtnRight.on(Input.EventType.TOUCH_START, this.onRightStart, this);
            this.BtnRight.on(Input.EventType.TOUCH_END, this.onRightEnd, this);
            this.BtnRight.on(Input.EventType.TOUCH_CANCEL, this.onRightEnd, this);
        }

        if (this.BtnJump != null) {
            this.BtnJump.on(Input.EventType.TOUCH_START, this.onJumpStart, this);
            this.BtnJump.on(Input.EventType.TOUCH_END, this.onJumpEnd, this);
            this.BtnJump.on(Input.EventType.TOUCH_CANCEL, this.onJumpEnd, this);
        }

        if (this.BtnDash != null)
            this.BtnDash.on(Input.EventType.TOUCH_START, this.onDash, this);

        if (this.BtnAttack != null) {
            this.BtnAttack.on(Input.EventType.TOUCH_START, this.onFireStart, this);
            this.BtnAttack.on(Input.EventType.TOUCH_END, this.onFireEnd, this);
            this.BtnAttack.on(Input.EventType.TOUCH_CANCEL, this.onFireEnd, this);
            director.on(ConstantBase.INPUT_FIRE_SHOW, this.onFireShow, this);
        }

        if (this.BtnInteraction != null) {
            this.BtnInteraction.on(Input.EventType.TOUCH_START, this.onInteraction, this);
            director.on(ConstantBase.INPUT_INTERACTION_SHOW, this.onInteractionShow, this);
            director.on(ConstantBase.INPUT_INTERACTION_ICON, this.onInteractionIcon, this);
        }

        this.Switch.forEach(Item => {
            Item.on(Input.EventType.TOUCH_START, this.onSwitch, this);
        });
    }

    protected start(): void {
        if (this.DebugUpdate != null) {
            switch (sys.os) {
                case sys.OS.ANDROID:
                case sys.OS.IOS:
                    this.DebugUpdate.node.active = false;
                    break;
                default:
                    this.DebugUpdate.node.active = true;
                    break;
            }
        }

        if (this.SwitchStart && this.Switch.length > 0) {
            this.SwitchStartIndex = math.clamp(this.SwitchStartIndex, 0, this.Switch.length - 1);
            if (this.Switch[this.SwitchStartIndex].getComponent(UIOpacity) != null)
                this.Switch[this.SwitchStartIndex].getComponent(UIOpacity).opacity = 150;
            else
                this.Switch[this.SwitchStartIndex].active = false;
            director.emit(ConstantBase.INPUT_SWITCH, this.SwitchStartIndex, this.Switch[this.SwitchStartIndex]);
        }
        else
            director.emit(ConstantBase.INPUT_SWITCH_UNFOCUS);
    }

    protected update(dt: number) {
        if (this.DebugUpdate != null) {
            if (this.DebugUpdate.node.activeInHierarchy) {
                this.m_debugDt = dt;
                if (this.m_debugDtReset == 0) {
                    this.m_debugDtReset = 60;
                    this.m_debugDtMax = 0;
                }
                else
                    this.m_debugDtReset--;
                if (this.m_debugDt > this.m_debugDtMax)
                    this.m_debugDtMax = this.m_debugDt;
                this.DebugUpdate.string = 'dt: ' + this.m_debugDt.toFixed(3).toString() + ' (max: ' + this.m_debugDtMax.toFixed(3).toString() + ')';
            }
        }

        if (this.m_lock || this.DirectStore || ManagerEvent.Finish) {
            this.m_up = false;
            this.m_down = false;
            this.m_left = false;
            this.m_right = false;
            this.m_jump = false;
            this.m_attack = false;
            return;
        }

        if (this.JoyMove != null) {
            let joyDirection = this.JoyMove.m_direction.clone();
            if (!this.m_keyboard || joyDirection.x != 0 || joyDirection.y != 0) {
                switch (this.JoyMoveType) {
                    case JoyStickDirectionType.X:
                    case JoyStickDirectionType.Y:
                        //ZERO
                        if (joyDirection.x == 0 && joyDirection.y == 0) {
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                            if (this.JoyMoveType == JoyStickDirectionType.Y)
                                director.emit(ConstantBase.INPUT_MOVE_RELEASE_X);
                            else if (this.JoyMoveType == JoyStickDirectionType.X)
                                director.emit(ConstantBase.INPUT_MOVE_RELEASE_Y);
                            break;
                        }
                        let deg = Math.atan2(joyDirection.y, joyDirection.x) * 57.295779513;
                        let deg360 = deg < 0 ? deg + 360 : deg;
                        //X
                        if (joyDirection.x == 0 && this.JoyMoveType == JoyStickDirectionType.Y)
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE_X);
                        else if (135 < deg360 && deg360 < 225)
                            director.emit(ConstantBase.INPUT_MOVE_LEFT);
                        else if (-45 < deg && deg < 45)
                            director.emit(ConstantBase.INPUT_MOVE_RIGHT);
                        else if (this.JoyMoveType == JoyStickDirectionType.X)
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                        else
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE_X);
                        //Y
                        if (joyDirection.y == 0 && this.JoyMoveType == JoyStickDirectionType.X)
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE_Y);
                        else if (45 < deg360 && deg360 < 135)
                            director.emit(ConstantBase.INPUT_MOVE_UP);
                        else if (-135 < deg && deg < -45)
                            director.emit(ConstantBase.INPUT_MOVE_DOWN);
                        else if (this.JoyMoveType == JoyStickDirectionType.Y)
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                        else
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE_Y);
                        break;
                    case JoyStickDirectionType.EIGHT:
                        //ZERO
                        if (joyDirection.x == 0 && joyDirection.y == 0)
                            director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                        //DIRECTION
                        director.emit(ConstantBase.INPUT_JOY_STICK, joyDirection);
                        break;
                }
            }
            else if (sys.os == sys.OS.WINDOWS && this.JoyMove.node.activeInHierarchy) {
                //X
                if (this.m_left)
                    director.emit(ConstantBase.INPUT_MOVE_LEFT);
                else if (this.m_right)
                    director.emit(ConstantBase.INPUT_MOVE_RIGHT);
                else if (this.JoyMoveType == JoyStickDirectionType.X)
                    director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                else
                    director.emit(ConstantBase.INPUT_MOVE_RELEASE_X);
                //Y
                if (this.m_up)
                    director.emit(ConstantBase.INPUT_MOVE_UP);
                else if (this.m_down)
                    director.emit(ConstantBase.INPUT_MOVE_DOWN);
                else if (this.JoyMoveType == JoyStickDirectionType.Y)
                    director.emit(ConstantBase.INPUT_MOVE_RELEASE);
                else
                    director.emit(ConstantBase.INPUT_MOVE_RELEASE_Y);
            }
        }
        else {
            if (this.BtnLeft != null ? this.BtnLeft.activeInHierarchy && this.m_left : false)
                director.emit(ConstantBase.INPUT_MOVE_LEFT);
            else if (this.BtnRight != null ? this.BtnRight.activeInHierarchy && this.m_right : false)
                director.emit(ConstantBase.INPUT_MOVE_RIGHT);
            else if (this.BtnLeft != null || this.BtnRight != null)
                director.emit(ConstantBase.INPUT_MOVE_RELEASE);
        }

        if (this.BtnJump != null ? this.BtnJump.activeInHierarchy && this.m_jump : false)
            director.emit(ConstantBase.INPUT_JUMP, dt);

        if (this.BtnAttack != null ? this.AttackUpdate : false) {
            if (this.BtnAttack.activeInHierarchy) {
                if (this.m_attack)
                    director.emit(ConstantBase.INPUT_FIRE, true);
                else if (this.AttackFull)
                    director.emit(ConstantBase.INPUT_FIRE, false);
            }
        }
    }

    //

    onLock() {
        this.m_lock = true;

        if (this.BtnUp != null)
            this.BtnUp.active = false;

        if (this.BtnDown != null)
            this.BtnDown.active = false;

        if (this.BtnLeft != null)
            this.BtnLeft.active = false;

        if (this.BtnRight != null)
            this.BtnRight.active = false;

        if (this.BtnJump != null)
            this.BtnJump.active = false;

        if (this.JoyMove != null)
            this.JoyMove.node.active = false;

        if (this.BtnAttack != null)
            this.BtnAttack.active = false;

        if (this.BtnInteraction != null)
            this.BtnInteraction.active = false;

        for (let i = 0; i < this.Switch.length; i++)
            this.Switch[i].active = false;

        for (let i = 0; i < this.Other.length; i++)
            this.Other[i].active = false;
    }

    onResume() {
        this.m_lock = false;

        if (this.BtnUp != null)
            this.BtnUp.active = this.m_avaible;

        if (this.BtnDown != null)
            this.BtnDown.active = this.m_avaible;

        if (this.BtnLeft != null)
            this.BtnLeft.active = this.m_avaible;

        if (this.BtnRight != null)
            this.BtnRight.active = this.m_avaible;

        if (this.BtnJump != null)
            this.BtnJump.active = this.m_avaible;

        if (this.JoyMove != null)
            this.JoyMove.node.active = this.m_avaible;

        if (this.BtnAttack != null)
            this.BtnAttack.active = this.m_avaible;

        if (this.BtnInteraction != null)
            this.BtnInteraction.active = this.m_avaible;

        for (let i = 0; i < this.Switch.length; i++)
            this.Switch[i].active = this.m_avaible;

        for (let i = 0; i < this.Other.length; i++)
            this.Other[i].active = this.m_avaible;
    }

    //Move Up

    onUpStart() {
        this.m_up = true;
        director.emit(ConstantBase.INPUT_MOVE_UP);
    }

    onUpEnd() {
        this.m_up = false;
    }

    //Move Down

    onDownStart() {
        this.m_down = true;
        director.emit(ConstantBase.INPUT_MOVE_DOWN);
    }

    onDownEnd() {
        this.m_down = false;
    }

    //Move Left

    onLeftStart() {
        this.m_left = true;
        director.emit(ConstantBase.INPUT_MOVE_LEFT);
    }

    onLeftEnd() {
        this.m_left = false;
    }

    //Move Right

    onRightStart() {
        this.m_right = true;
        director.emit(ConstantBase.INPUT_MOVE_RIGHT);
    }

    onRightEnd() {
        this.m_right = false;
    }

    //Jump

    onJumpStart() {
        this.m_jump = true;
        director.emit(ConstantBase.INPUT_JUMP, 0);
    }

    onJumpEnd() {
        this.m_jump = false;
        director.emit(ConstantBase.INPUT_JUMP_RELEASE);
    }

    //Dash

    onDash() {
        director.emit(ConstantBase.INPUT_DASH);
    }

    //Fire

    onFireStart() {
        if (this.AttackUpdate)
            this.m_attack = true;
        else
            director.emit(ConstantBase.INPUT_FIRE, true);
    }

    onFireEnd() {
        if (this.AttackUpdate)
            this.m_attack = false;
        else if (this.AttackFull)
            director.emit(ConstantBase.INPUT_FIRE, false);
    }

    onFireShow(stage: boolean) {
        this.BtnAttack.active = this.m_avaible && stage;
    }

    //Interaction

    onInteraction() {
        director.emit(ConstantBase.INPUT_INTERACTION);
    }

    onInteractionShow(stage: boolean) {
        this.BtnInteraction.active = this.m_avaible && stage;
    }

    onInteractionIcon(index: number) {
        for (let i = 0; i < this.IconInteraction.length; i++)
            this.IconInteraction[i].active = this.m_avaible && i == index;
    }

    //Switch

    onSwitch(event: EventTouch) {
        const target = event.target as Node;
        for (let i = 0; i < this.Switch.length; i++) {
            if (this.Switch[i] == target) {
                if (this.Switch[i].getComponent(UIOpacity) != null)
                    this.Switch[i].getComponent(UIOpacity).opacity = 150;
                else
                    this.Switch[i].active = false;
                director.emit(ConstantBase.INPUT_SWITCH, i);
            }
            else {
                if (this.Switch[i].getComponent(UIOpacity) != null)
                    this.Switch[i].getComponent(UIOpacity).opacity = 255;
                else
                    this.Switch[i].active = this.m_avaible;
            }
        }
    }

    //

    onKeyPressed(event) {
        if (this.m_lock || this.DirectStore || ManagerEvent.Finish)
            return;
        this.m_keyboard = true;
        let keyCode = event.keyCode;
        switch (keyCode) {
            case this.KeyUp:
                this.onUpStart();
                break;
            case this.KeyDown:
                this.onDownStart();
                break;
            case this.KeyLeft:
                this.onLeftStart();
                break;
            case this.KeyRight:
                this.onRightStart();
                break;
            case this.KeyJump:
                this.onJumpStart();
                break;
            case this.KeyAttack:
                this.onFireStart();
                break;
            case this.KeyDash:
                this.onDash();
                break;
            case this.KeyInteracte:
                this.onInteraction();
                break;
        }
    }

    onKeyReleased(event) {
        if (this.m_lock || this.DirectStore || ManagerEvent.Finish)
            return;
        let keyCode = event.keyCode;
        switch (keyCode) {
            case this.KeyUp:
                this.onUpEnd();
                break;
            case this.KeyDown:
                this.onDownEnd();
                break;
            case this.KeyLeft:
                this.onLeftEnd();
                break;
            case this.KeyRight:
                this.onRightEnd();
                break;
            case this.KeyJump:
                this.onJumpEnd();
                break;
            case this.KeyAttack:
                this.onFireEnd();
                break;
            case this.KeyDash:
                //...
                break;
            case this.KeyInteracte:
                //...
                break;
        }
        if (!this.m_up &&
            !this.m_down &&
            !this.m_left &&
            !this.m_right &&
            !this.m_jump &&
            !this.m_attack)
            this.m_keyboard = false;
    }
}