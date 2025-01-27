import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, director, Enum, Node, RigidBody2D, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { ConstantBase } from '../ConstantBase';
import { DataRigidbody } from '../data/DataRigidbody';
import { BodyBase } from './BodyBase';
import { BodySpine } from './BodySpine';
import { BodyAttackX } from './hit/BodyAttackX';
import { BodyCheckX } from './physic/BodyCheckX';
import { BodyKnockX } from './physic/BodyKnockX';
const { ccclass, property, requireComponent } = _decorator;

export enum PlayerState {
    IDLE,
    MOVE,
    PUSH,
    JUMP,
    AIR,
    HIT,
    DEAD,
    DASH,
    PICK,
    THOW,
    ATTACK,
    ATTACK_HOLD,
};
Enum(PlayerState);

export enum BodyType {
    STICK,
    BALL,
}
Enum(BodyType)

@ccclass('BodyControlX')
@requireComponent([BodyCheckX, BodySpine, RigidBody2D])
export class BodyControlX extends Component {

    @property({ type: BodyType })
    Type: BodyType = BodyType.STICK;

    @property({ group: { name: 'MoveX' }, type: CCBoolean })
    LockX: boolean = false;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveForceX = 10;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveDampX = 40;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX && this.Type == BodyType.BALL; } })
    TorqueX = 2000;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveGroundX: number = 40;
    @property({ group: { name: 'MoveX' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockX; } })
    MoveAirX: number = 40;
    @property({ group: { name: 'MoveX' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockX; } })
    MoveForceStop = true;
    @property({ group: { name: 'MoveX' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockX; } })
    MoveForceFlip = true;

    @property({ group: { name: 'MoveY' }, type: CCBoolean })
    LockY: boolean = false;
    @property({ group: { name: 'MoveY' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockY; } })
    JumpUpY: number = 90;
    @property({ group: { name: 'MoveY' }, type: CCFloat, visible(this: BodyControlX) { return !this.LockY; } })
    JumpDelay: number = 0.15;
    @property({ group: { name: 'MoveY' }, type: CCInteger, visible(this: BodyControlX) { return !this.LockY; } })
    JumpCount: number = 1;
    @property({ group: { name: 'MoveY' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockY; } })
    JumpFall: boolean = false;
    @property({ group: { name: 'MoveY' }, type: CCBoolean, visible(this: BodyControlX) { return !this.LockY; } })
    JumpAuto: boolean = false;

    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackHold: boolean = false;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackStopMoveAnim = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackStopMovePress = true;
    @property({ group: { name: 'Attack' }, type: CCBoolean, visible(this: BodyControlX) { return this.getComponent(BodyAttackX) != null; } })
    AttackStopFall = false;

    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean })
    Pick: boolean = false;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    PickHold: boolean = false;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    PickJumpOnce: boolean = true;
    @property({ group: { name: 'Pick&Throw' }, type: Vec2, visible(this: BodyControlX) { return this.Pick; } })
    ThrowForce: Vec2 = v2(20, 20);
    @property({ group: { name: 'Pick&Throw' }, type: Node, visible(this: BodyControlX) { return this.Pick; } })
    PickUpPoint: Node = null;
    @property({ group: { name: 'Pick&Throw' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    UiPickBtnActive: boolean = true;
    @property({ group: { name: 'Pick&Throw' }, type: CCInteger, visible(this: BodyControlX) { return this.Pick; } })
    UiPickIconIndex: number = 0;
    @property({ group: { name: 'Pick&Throw' }, type: CCInteger, visible(this: BodyControlX) { return this.Pick; } })
    UiThrowIconIndex: number = 1;

    @property({ group: { name: 'End' }, type: CCBoolean, visible(this: BodyControlX) { return this.Pick; } })
    EndPickDestroy: boolean = true;
    @property({ group: { name: 'End' }, type: CCBoolean })
    EndOnGround: boolean = true;
    @property({ group: { name: 'End' }, type: CCBoolean })
    EndRevertX: boolean = false;

    m_baseSize: number = 1;
    m_baseMass: number = 0;
    m_baseScale: Vec3 = Vec3.ONE;
    m_baseGravity: number = 0;

    m_state = PlayerState.IDLE;
    m_moveDirX: number = 0;
    m_faceDirX: number = 1;
    m_faceDirY: number = 0;

    m_jumpSchedule: any = null;
    m_jumpCountCurrent: number = 0;
    m_jumpContinue: boolean = false;

    m_dash: boolean = false;

    m_attack: boolean = false;
    m_attackReadySchedule: any = null;

    m_pickUp: Node = null;
    m_pickUpProgess: boolean = false;
    m_pickUpRigidbody: DataRigidbody = null;
    m_pickUpParent: Node = null;
    m_pickUpSiblingIndex: number = 0;

    m_control: boolean = true;
    m_end: boolean = false;
    m_endReady: boolean = false;

    m_lockInput: boolean = false;
    m_lockJump: boolean = false;
    m_lockKnockBack: boolean = false;
    m_lockVelocity: boolean = false;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_bodySpine: BodySpine = null;
    m_bodyKnock: BodyKnockX = null;
    m_bodyAttack: BodyAttackX = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_bodySpine = this.getComponent(BodySpine);
        this.m_bodyKnock = this.getComponent(BodyKnockX);
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.onControlByDirector(true);
        director.on(ConstantBase.PLAYER_COMPLETE, this.onComplete, this);
        director.on(ConstantBase.GAME_TIME_OUT, this.onStop, this);

        this.node.on(this.m_body.m_emitBodyBaseDead, this.onDead, this);
        this.node.on(this.m_bodyCheck.m_emitBot, this.onBot, this);
        this.node.on(this.m_bodyCheck.m_emitInteracte, this.onInteractionFound, this);
        this.node.on(ConstantBase.NODE_CONTROL_DIRECTOR, this.onControlByDirector, this);
        this.node.on(ConstantBase.NODE_CONTROL_NODE, this.onControlByNode, this);
    }

    protected start(): void {
        this.m_baseScale = this.node.scale.clone();
        this.m_baseSize = 1;
        this.m_baseGravity = this.m_rigidbody.gravityScale;
        this.m_baseMass = this.m_rigidbody.getMass();

        if (this.UiPickBtnActive)
            director.emit(ConstantBase.INPUT_INTERACTION_SHOW, false);
    }

    protected lateUpdate(dt: number): void {
        this.onPhysicUpdate(dt);
        this.onStateUpdate(dt);
        this.onCompleteGroundUpdate(dt);
    }

    //EVENT:

    protected onControlByDirector(state: boolean) {
        if (state) {
            director.on(ConstantBase.BODY_SLEEP, this.onSleep, this);
            director.on(ConstantBase.BODY_AWAKE, this.onAwake, this);

            director.on(ConstantBase.CONTROL_JUMP, this.onJump, this);
            director.on(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            director.on(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            director.on(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            director.on(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.on(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.on(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.on(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            director.on(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            if (this.m_bodyAttack != null) {
                director.on(ConstantBase.BODY_ATTACK_UP, this.m_bodyAttack.onMeleeAttackUp, this.m_bodyAttack);
                director.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
            }

            director.on(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            director.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);
        }
        else {
            director.off(ConstantBase.BODY_SLEEP, this.onSleep, this);
            director.off(ConstantBase.BODY_AWAKE, this.onAwake, this);

            director.off(ConstantBase.CONTROL_JUMP, this.onJump, this);
            director.off(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            director.off(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            director.off(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            director.off(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            director.off(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            director.off(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            director.off(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            director.off(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            if (this.m_bodyAttack != null) {
                director.off(ConstantBase.BODY_ATTACK_UP, this.m_bodyAttack.onMeleeAttackUp, this.m_bodyAttack);
                director.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
            }

            director.off(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            director.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);
        }
    }

    protected onControlByNode(state: boolean) {
        if (state) {
            this.node.on(ConstantBase.BODY_SLEEP, this.onSleep, this);
            this.node.on(ConstantBase.BODY_AWAKE, this.onAwake, this);

            this.node.on(ConstantBase.CONTROL_JUMP, this.onJump, this);
            this.node.on(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            this.node.on(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            this.node.on(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            this.node.on(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            this.node.on(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            this.node.on(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            this.node.on(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            this.node.on(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            if (this.m_bodyAttack != null) {
                this.node.on(ConstantBase.BODY_ATTACK_UP, this.m_bodyAttack.onMeleeAttackUp, this.m_bodyAttack);
                this.node.on(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
            }

            this.node.on(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            this.node.on(ConstantBase.CONTROL_FIXED, this.onFixed, this);
        }
        else {
            this.node.off(ConstantBase.BODY_SLEEP, this.onSleep, this);
            this.node.off(ConstantBase.BODY_AWAKE, this.onAwake, this);

            this.node.off(ConstantBase.CONTROL_JUMP, this.onJump, this);
            this.node.off(ConstantBase.CONTROL_JUMP_RELEASE, this.onJumRelease, this);

            this.node.off(ConstantBase.CONTROL_UP, this.onMoveUp, this);
            this.node.off(ConstantBase.CONTROL_DOWN, this.onMoveDown, this);
            this.node.off(ConstantBase.CONTROL_LEFT, this.onMoveLeft, this);
            this.node.off(ConstantBase.CONTROL_RIGHT, this.onMoveRight, this);
            this.node.off(ConstantBase.CONTROL_RELEASE, this.onMoveRelease, this);
            this.node.off(ConstantBase.CONTROL_RELEASE_X, this.onMoveReleaseX, this);
            this.node.off(ConstantBase.CONTROL_RELEASE_Y, this.onMoveReleaseY, this);

            if (this.m_bodyAttack != null) {
                this.node.off(ConstantBase.BODY_ATTACK_UP, this.m_bodyAttack.onMeleeAttackUp, this.m_bodyAttack);
                this.node.off(ConstantBase.CONTROL_ATTACK, this.onAttack, this);
            }

            this.node.off(ConstantBase.CONTROL_INTERACTION, this.onInteraction, this);
            this.node.off(ConstantBase.CONTROL_FIXED, this.onFixed, this);
        }
    }

    //STOP:

    protected onStop() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);
        this.onJumRelease();
        this.onMoveRelease();
    }

    //RIGIDBODY:

    onSleep() {
        this.onJumRelease();
        this.onMoveRelease();
        this.m_rigidbody.gravityScale = 0;
        this.m_rigidbody.sleep();
    }

    onAwake() {
        this.m_rigidbody.gravityScale = this.m_baseGravity;
        this.m_rigidbody.wakeUp();
    }

    //MOVE:

    protected onPhysicUpdate(dt: number) {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;

        if (this.m_lockVelocity)
            return;

        //if (!this.m_rigidbody.isAwake())
        //Rigidbody wake up again if it's not awake
        //    this.m_rigidbody.wakeUp();

        if (this.JumpAuto && this.m_bodyCheck.m_isBot)
            this.onJump(dt);

        if (this.m_dash)
            return;

        if (this.getKnock()) {
            //Rigidbody unable move when in knock state
            if (this.m_bodyKnock != null)
                //Fixed knock velocity on player body
                this.m_bodyKnock.onKnock(
                    this.m_bodyKnock.m_from,
                    this.m_bodyKnock.HitDeg,
                    this.m_bodyKnock.HitForce);
            return;
        }

        switch (this.Type) {
            case BodyType.STICK:
                if ((this.AttackStopMoveAnim && this.getAttack()) || (this.AttackStopMovePress && this.m_attack)) {
                    this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                    return;
                }
                if (this.m_bodyCheck.m_isHead) {
                    this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                    return;
                }
                break;
        }

        if (this.MoveForceStop && this.m_moveDirX == 0 && this.m_rigidbody.linearVelocity.clone().x != 0) {
            this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
            if (this.Type == BodyType.BALL)
                this.m_rigidbody.applyTorque(0, true);
            return;
        }

        if (this.MoveForceFlip && this.m_moveDirX != 0) {
            if (this.m_rigidbody.linearVelocity.clone().x > 0 && this.m_moveDirX < 0) {
                this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                if (this.Type == BodyType.BALL)
                    this.m_rigidbody.applyTorque(0, true);
                return;
            }
            if (this.m_rigidbody.linearVelocity.clone().x < 0 && this.m_moveDirX > 0) {
                this.m_rigidbody.linearVelocity = v2(0, this.m_rigidbody.linearVelocity.y);
                if (this.Type == BodyType.BALL)
                    this.m_rigidbody.applyTorque(0, true);
                return;
            }
        }

        let velocity = this.m_rigidbody.linearVelocity.clone();
        let current = velocity.clone();

        if (this.m_body.m_dead || !this.m_control) {
            velocity.x = 0;
        }
        else {
            switch (this.Type) {
                case BodyType.STICK:
                    if (this.m_bodyCheck.m_isBot) {
                        velocity.x += this.m_moveDirX * this.MoveForceX;
                        if (velocity.x > this.MoveGroundX)
                            velocity.x = this.MoveGroundX;
                        else if (velocity.x < -this.MoveGroundX)
                            velocity.x = -this.MoveGroundX;
                    }
                    else {
                        velocity.x += this.m_moveDirX * this.MoveAirX;
                        if (velocity.x > this.MoveAirX)
                            velocity.x = this.MoveAirX;
                        else if (velocity.x < -this.MoveAirX)
                            velocity.x = -this.MoveAirX;
                    }
                    break;
                case BodyType.BALL:
                    if (this.m_bodyCheck.m_isBot) {
                        this.m_rigidbody.applyTorque(-this.m_moveDirX * this.TorqueX * (this.m_rigidbody.getMass() / this.m_baseMass) * this.m_baseSize, true);
                        velocity.x += this.m_moveDirX * this.MoveGroundX;
                        if (velocity.x > this.MoveGroundX)
                            velocity.x = this.MoveGroundX;
                        else if (velocity.x < -this.MoveGroundX)
                            velocity.x = -this.MoveGroundX;
                    }
                    else {
                        velocity.x += this.m_moveDirX * this.MoveAirX;
                        if (velocity.x > this.MoveAirX)
                            velocity.x = this.MoveAirX;
                        else if (velocity.x < -this.MoveAirX)
                            velocity.x = -this.MoveAirX;
                    }
                    break;
            }
        }
        let damp = current.lerp(velocity, this.MoveDampX * dt);
        this.m_rigidbody.linearVelocity = damp;
    }

    onMoveUp() {
        this.m_faceDirY = 1;
    }

    onMoveDown() {
        this.m_faceDirY = -1;
    }

    onMoveLeft() {
        this.m_moveDirX = !this.LockX ? -1 : 0;
        if (this.m_faceDirX != -1) {
            this.m_faceDirX = -1;
            this.m_bodySpine.onViewDirection(this.m_faceDirX);
            this.m_bodyCheck.onDirUpdate(this.m_faceDirX);
            if (this.m_bodyAttack != null)
                this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
        }
    }

    onMoveRight() {
        this.m_moveDirX = !this.LockX ? 1 : 0;
        if (this.m_faceDirX != 1) {
            this.m_faceDirX = 1;
            this.m_bodySpine.onViewDirection(this.m_faceDirX);
            this.m_bodyCheck.onDirUpdate(this.m_faceDirX);
            if (this.m_bodyAttack != null)
                this.m_bodyAttack.onDirUpdate(this.m_faceDirX);
        }
    }

    onMoveRelease() {
        this.onMoveReleaseX();
        this.onMoveReleaseY();
    }

    onMoveReleaseX() {
        this.m_moveDirX = 0;
        if (this.MoveForceStop) {
            let veloc = this.m_rigidbody.linearVelocity.clone();
            veloc.x = 0;
            this.m_rigidbody.linearVelocity = veloc;
            if (this.Type == BodyType.BALL)
                this.m_rigidbody.applyTorque(0, true);
        }
    }

    onMoveReleaseY() {
        this.m_faceDirY = 0;
    }

    //JUMP:

    onJump(dt: number) {
        if (this.LockY || this.m_lockInput || this.m_jumpContinue || this.m_jumpCountCurrent >= this.JumpCount)
            return;

        if (this.PickJumpOnce && this.m_pickUp != null)
            this.m_jumpCountCurrent = this.JumpCount;
        else
            this.m_jumpCountCurrent++;
        this.m_jumpContinue = true;
        this.m_bodyCheck.onBotCheckOut();

        this.m_rigidbody.gravityScale = this.m_baseGravity;

        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = this.JumpUpY;
        this.m_rigidbody.linearVelocity = veloc;

        this.m_jumpSchedule = this.scheduleOnce(() => {
            this.m_lockJump = false;
        }, this.JumpDelay);
    }

    onJumRelease() {
        this.unschedule(this.m_jumpSchedule);
        this.m_lockJump = false;
        this.m_jumpContinue = false;
    }

    onJumpForce(jumpUp?: number) {
        this.m_bodyCheck.onBotCheckOut();

        this.m_rigidbody.gravityScale = this.m_baseGravity;

        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = jumpUp != null ? jumpUp : this.JumpUpY;
        this.m_rigidbody.linearVelocity = veloc;
    }

    protected onBot(stage: boolean) {
        switch (stage) {
            case true:
                this.m_jumpCountCurrent = 0;
                this.m_jumpContinue = false;
                break;
            case false:
                if (!this.JumpFall && this.m_jumpCountCurrent == 0)
                    this.m_jumpCountCurrent = this.JumpCount;
                break;
        }
    }

    //DASH:

    onDash() {
        if (this.m_dash)
            return;
        this.m_dash = true;
        this.m_rigidbody.linearVelocity = v2(5000 * this.m_faceDirX, 0);
        this.m_rigidbody.gravityScale = 0;
        this.scheduleOnce(() => {
            this.m_dash = false;
            this.m_rigidbody.linearVelocity = v2(0, 0);
            this.m_rigidbody.gravityScale = this.m_baseGravity;
        }, 0.15);
    }

    //ATTACK:

    onAttack(active: boolean, update: boolean = true) {
        if (update)
            this.m_attack = active;
        switch (active) {
            case true:
                if (this.AttackStopFall) {
                    this.unschedule(this.m_jumpSchedule);
                    this.m_lockJump = false;
                    this.m_rigidbody.gravityScale = 0;
                    this.m_rigidbody.sleep();
                    this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
                    if (this.m_bodyAttack != null)
                        this.m_bodyAttack.onAimDeg(this.m_faceDirX == 1 ? 0 : 180);
                }
                if (!this.AttackHold) {
                    if (this.m_bodyAttack != null)
                        this.m_bodyAttack.onAimDeg(this.m_faceDirX == 1 ? 0 : 180);
                    this.onAttackProgess();
                }
                break;
            case false:
                if (this.AttackStopFall) {
                    this.m_rigidbody.gravityScale = this.m_baseGravity;
                    this.m_rigidbody.linearVelocity = v2(this.m_rigidbody.linearVelocity.clone().x, -0.02); //Fix bug not fall after attack
                }
                if (this.AttackHold)
                    this.onAttackProgess();
                break;
        }
    }

    protected onAttackProgess() {
        if (this.m_bodyAttack == null)
            return;
        if (this.m_bodyAttack.Aim) {
            if (this.m_bodyAttack.m_rangeTarget == null ? true : !this.m_bodyAttack.m_rangeTarget.isValid)
                this.m_bodyAttack.m_rangeTarget = this.m_bodyAttack.m_bodyCheck.onRangeTargetNearest();
            if (this.m_bodyAttack.m_rangeTarget == null ? true : !this.m_bodyAttack.m_rangeTarget.isValid) {
                this.m_bodyAttack.onUnAim();
                this.m_bodyAttack.onAttackProgess();
            }
            else {
                this.m_bodyAttack.onAimTarget(this.m_bodyAttack.m_rangeTarget);
                this.scheduleOnce(() => this.m_bodyAttack.onUnAim(), this.m_bodyAttack.onAttackProgess());
            }
        }
        else
            this.m_bodyAttack.onAttackProgess()
    }

    //INTERACTION:

    onInteraction() {
        if (this.Pick)
            this.onInteractionPickAndThrow();
    }

    onInteractionPickAndThrow() {
        if (this.m_pickUpProgess)
            return;
        let delayPick = 0;
        if (this.m_pickUp == null) {
            if (this.m_bodyCheck.m_interacteTarget.length == 0)
                return;
            this.m_pickUpProgess = true;
            //Add Pick-up Object to current saved
            this.m_pickUp = this.m_bodyCheck.m_interacteTarget[0];
            this.m_pickUpParent = this.m_pickUp.parent;
            this.m_pickUpSiblingIndex = this.m_pickUp.getSiblingIndex();
            //Save Pick-up Object's Rigidbody imformation before destroy it
            let pickUpRigidbody = this.m_pickUp.getComponent(RigidBody2D);
            this.m_pickUpRigidbody = new DataRigidbody(pickUpRigidbody);
            this.scheduleOnce(() => {
                if (this.m_pickUp == null ? true : !this.m_pickUp.isValid)
                    return;
                pickUpRigidbody.destroy();
                //Set parent of Pick-up Object to Pick-up Point and Tween Move it
                this.m_pickUp.setParent(this.PickUpPoint, true);
                tween(this.m_pickUp)
                    .to(0.2, { position: Vec3.ZERO }, { easing: 'linear' })
                    .start();
            }, 0.02);
            //Node Event
            this.m_pickUp.emit(ConstantBase.NODE_PICK);
            //Animation
            delayPick = this.m_bodySpine.onPick();
            this.scheduleOnce(() => this.m_bodySpine.onPickLoop(), this.m_bodySpine.onPick());
            //Ui
            director.emit(ConstantBase.INPUT_INTERACTION_ICON, this.UiThrowIconIndex);
        }
        else {
            this.m_pickUpProgess = true;
            //Node Event
            this.m_pickUp.emit(ConstantBase.NODE_THROW);
            //Add Rigidbody to Pick-up Object and set back imformation to it
            let pickUpRigidbody = this.m_pickUp.addComponent(RigidBody2D);
            this.m_pickUpRigidbody.onUpdate(pickUpRigidbody);
            //Fixed collider collision after add Rigidbody component to Pick-up Object
            let pickUpColliders = this.m_pickUp.getComponents(Collider2D);
            pickUpColliders.forEach(collider => {
                collider.apply();
            });
            //Add velocity throw to Pick-up Object by current face dir and direction control
            this.scheduleOnce(() => {
                if (this.m_faceDirY > 0)
                    pickUpRigidbody.linearVelocity = v2(0, this.ThrowForce.y);
                else
                    pickUpRigidbody.linearVelocity = v2(this.ThrowForce.x * this.m_faceDirX, this.ThrowForce.y);
            }, 0.02);
            //Remove Pick-up Object from current saved
            this.m_pickUp.setParent(this.m_pickUpParent, true);
            this.m_pickUp.setSiblingIndex(this.m_pickUpSiblingIndex);
            this.m_pickUp = null;
            //Animation
            delayPick = this.m_bodySpine.onThrow();
            this.scheduleOnce(() => this.m_bodySpine.onPickEmty(), this.m_bodySpine.onThrow());
            //Ui
            if (this.UiPickBtnActive)
                director.emit(ConstantBase.INPUT_INTERACTION_SHOW, false);
            director.emit(ConstantBase.INPUT_INTERACTION_ICON, this.UiPickIconIndex);
        }
        if (this.m_pickUpProgess)
            this.scheduleOnce(() => this.m_pickUpProgess = false, delayPick + 0.02);
    }

    protected onInteractionFound(target: Node, stage: boolean) {
        if (this.m_pickUp != null)
            return;
        if (this.m_bodyCheck.m_interacteTarget.length == 0) {
            if (this.UiPickBtnActive)
                director.emit(ConstantBase.INPUT_INTERACTION_SHOW, false);
            return;
        }
        if (this.UiPickBtnActive)
            director.emit(ConstantBase.INPUT_INTERACTION_SHOW, true);
        director.emit(ConstantBase.INPUT_INTERACTION_ICON, this.UiPickIconIndex);
    }

    //FIXED:

    protected onFixed() {
        switch (this.Type) {
            case BodyType.STICK:
                break;
            case BodyType.BALL:
                this.onJumpForce();
                tween(this.node)
                    .to(0.5, { eulerAngles: v3(0, 0, 0) })
                    .start();
                break;
        }
    }

    //STAGE:

    protected onStateUpdate(dt: number) {
        let state = PlayerState.IDLE;
        //FIND STAGE:
        if (this.getDead())
            state = PlayerState.DEAD;
        else if (this.getHit())
            state = PlayerState.HIT;
        else if (this.m_attack && this.AttackHold)
            state = PlayerState.ATTACK_HOLD;
        else if (this.getAttack())
            state = PlayerState.ATTACK;
        else if (this.m_dash)
            state = PlayerState.DASH;
        else if (this.m_bodyCheck.m_isBot) {
            if (this.m_moveDirX == 0)
                state = PlayerState.IDLE;
            else if (!this.m_bodyCheck.m_isHead)
                state = PlayerState.MOVE;
            else
                state = PlayerState.PUSH;
        }
        else {
            if (this.m_rigidbody.linearVelocity.y > 0)
                state = PlayerState.JUMP;
            else if (this.m_rigidbody.linearVelocity.y < 0)
                state = PlayerState.AIR;
        }
        //UPDATE STAGE:
        if (this.m_state == state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case PlayerState.IDLE:
                this.m_bodySpine.onIdle();
                break;
            case PlayerState.MOVE:
                this.m_bodySpine.onMove();
                break;
            case PlayerState.PUSH:
                this.m_bodySpine.onPush();
                break;
            case PlayerState.JUMP:
                this.m_bodySpine.onAirOn();
                break;
            case PlayerState.AIR:
                this.m_bodySpine.onAirOff();
                break;
            case PlayerState.HIT:
                break;
            case PlayerState.DASH:
                this.m_bodySpine.onDash();
                break;
            case PlayerState.ATTACK:
                if (!this.m_bodyAttack.AnimAttackHoldActive)
                    break;
                this.unschedule(this.m_attackReadySchedule);
                break;
            case PlayerState.ATTACK_HOLD:
                if (!this.m_bodyAttack.AnimAttackHoldActive)
                    break;
                this.m_attackReadySchedule = this.scheduleOnce(() => {
                    this.m_bodyAttack.onAttackHold();
                }, this.m_bodyAttack.onAttackReady());
                break;
        }
        this.m_state = state;
    }

    //GET:

    getHit(): boolean {
        if (this.m_bodySpine != null ? this.m_bodySpine.AnimHitActive : false)
            return this.m_bodySpine.m_hit;
        return this.m_body.m_hit;
    }

    getDead(): boolean {
        if (this.m_bodySpine != null)
            return this.m_bodySpine.m_dead;
        return this.m_body.m_dead;
    }

    getKnock(): boolean {
        if (this.m_bodyKnock != null)
            return this.m_bodyKnock.m_knock;
        return false;
    }

    getAttack(): boolean {
        if (this.m_bodyAttack != null)
            return this.m_bodyAttack.m_attack;
        return false;
    }

    //COMPLETE:

    /**Check Player on ground after excute complete and 'EndOnGround' value is TRUE*/
    protected onCompleteGroundUpdate(dt: number) {
        if (!this.EndOnGround)
            return;
        if (!this.m_end || !this.m_endReady || !this.m_bodyCheck.m_isBot)
            return;
        this.m_endReady = false;
        this.onCompleteProgess();
    }

    /**Excute Player complete, but not continue complete progress if 'EndOnGround' value is TRUE*/
    protected onComplete(Centre: Vec3) {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;
        this.m_endReady = this.EndOnGround;

        this.onJumRelease();
        this.onMoveRelease();

        if (!this.EndOnGround)
            this.onCompleteProgess();
    }

    protected onCompleteProgess() {
        if (this.Pick && this.EndPickDestroy) {
            if (this.m_pickUp != null ? this.m_pickUp.isValid : false)
                this.m_pickUp.destroy();
            this.m_bodySpine.onPickEmty();
        }
        if (this.EndRevertX) {
            this.m_faceDirX *= -1;
            this.m_bodySpine.onViewDirection(this.m_faceDirX);
        }
        this.scheduleOnce(() => {
            this.scheduleOnce(() => {
                director.emit(ConstantBase.GAME_COMPLETE);
            }, this.m_bodySpine.onComplete());
        }, 0);
    }

    //DEAD:

    protected onDead() {
        director.emit(ConstantBase.CONTROL_RELEASE);
        director.emit(ConstantBase.CONTROL_JUMP_RELEASE);
        director.emit(ConstantBase.CONTROL_LOCK);

        this.m_end = true;

        this.onJumRelease();
        this.onMoveRelease();

        if (this.EndPickDestroy) {
            this.m_pickUp.destroy();
            this.m_bodySpine.onPickEmty();
        }
        this.scheduleOnce(() => {
            this.m_rigidbody.sleep();
            this.scheduleOnce(() => this.m_rigidbody.wakeUp(), 0.02);
            this.scheduleOnce(() => {
                console.log('Game Lose');
                director.emit(ConstantBase.GAME_LOSE);
            }, this.m_bodySpine.onDead());
        }, 0);
    }
}