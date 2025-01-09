import { _decorator, CCBoolean, CCFloat, Component, Enum, RigidBody2D } from 'cc';
import { BaseConstant } from '../../BaseConstant';
import { SpineBase } from '../../renderer/SpineBase';
import { BodyBase } from '../BodyBase';
import { BodySpine } from '../BodySpine';
import { BodyAttackX } from '../hit/BodyAttackX';
import { BodyCheckX } from './BodyCheckX';
import { BodyKnockX } from './BodyKnockX';
const { ccclass, property, requireComponent } = _decorator;

export enum BodyState {
    NONE, //This compomnent out of control when in this state
    IDLE,
    MOVE,
    HIT,
    DEAD,
}
Enum(BodyState)

@ccclass('BodyMovePathX')
@requireComponent(BodyBase)
@requireComponent(BodySpine)
@requireComponent(BodyCheckX)
@requireComponent(SpineBase)
@requireComponent(RigidBody2D)
export class BodyMovePathX extends Component {

    @property({ group: { name: 'Move' }, type: CCBoolean })
    MoveRight: boolean = true;
    @property({ group: { name: 'Move' }, type: CCFloat })
    MoveGroundX: number = 5;
    @property({ group: { name: 'Move' }, type: CCFloat })
    MoveAirX: number = 0;

    @property({ group: { name: 'Move' }, type: CCBoolean })
    CheckHead: boolean = true;
    @property({ group: { name: 'Move' }, type: CCBoolean })
    CheckBotHead: boolean = true;

    @property({ group: { name: 'Path' }, type: CCBoolean })
    PathActive: boolean = false;
    @property({ group: { name: 'Path' }, type: CCFloat })
    PathOffsetXL: number = 500;
    @property({ group: { name: 'Path' }, type: CCFloat })
    PathOffsetXR: number = 500;

    m_state: BodyState = BodyState.IDLE;
    m_move: boolean = false;
    m_dir: number;
    m_animHitDuration: number = 0;
    m_pathXStart: number;
    m_pathXL: number;
    m_pathXR: number;

    m_lockVelocity: boolean = false;
    m_pick: boolean = false;
    m_picked: boolean = false;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_bodySpine: BodySpine = null;
    m_bodyKnock: BodyKnockX = null;
    m_bodyAttack: BodyAttackX = null;
    m_spine: SpineBase = null;
    m_rigidbody: RigidBody2D = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_bodySpine = this.getComponent(BodySpine);
        this.m_bodyKnock = this.getComponent(BodyKnockX);
        this.m_bodyAttack = this.getComponent(BodyAttackX);
        this.m_spine = this.getComponent(SpineBase);
        this.m_rigidbody = this.getComponent(RigidBody2D);

        this.node.on(BaseConstant.ON_NODE_PICK, this.onPick, this);
        this.node.on(BaseConstant.ON_NODE_THROW, this.onThrow, this);
    }

    protected start(): void {
        this.m_dir = this.MoveRight ? 1 : -1;
        this.m_pathXStart = this.node.position.clone().x;
        this.m_pathXL = this.m_pathXStart - this.PathOffsetXL;
        this.m_pathXR = this.m_pathXStart + this.PathOffsetXR;
        this.scheduleOnce(() => {
            this.m_bodyCheck.onDirUpdate(this.m_dir);
            this.m_spine.onFaceDir(this.m_dir);
            this.onAttackRangeUpdate();
        }, 0.02)
    }

    protected update(dt: number): void {
        this.onPhysicUpdate();
        this.onHeadChange();
        this.onStateUpdate();
    }

    //

    onPhysicUpdate() {
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            this.m_rigidbody = this.getComponent(RigidBody2D);
        if (this.m_rigidbody == null || !this.m_rigidbody.isValid)
            return;

        //if (!this.m_rigidbody.isAwake())
        //Rigidbody wake up again if it's not awake
        //    this.m_rigidbody.wakeUp();

        if (this.getKnock())
            //Rigidbody unable move when in knock state
            return;

        if (this.m_picked && !this.m_pick && this.m_bodyCheck.m_isBot) {
            this.m_picked = false;
            this.m_lockVelocity = false;
        }

        if (this.m_lockVelocity)
            return;

        let velocity = this.m_rigidbody.linearVelocity.clone();
        if (this.getDead() || this.getHit()) {
            this.m_move = false;
            velocity.x = 0;
        }
        else if (this.getAttack()) {
            this.m_move = false;
            velocity.x = 0;
        }
        else if (this.m_bodyCheck.m_isBot) {
            this.m_move = this.MoveGroundX > 0;
            velocity.x = this.m_dir * this.MoveGroundX;
        }
        else {
            this.m_move = this.MoveAirX > 0;
            velocity.x = this.m_dir * this.MoveAirX;
        }
        this.m_rigidbody.linearVelocity = velocity;
    }

    //

    onHeadChange() {
        if (this.getDead() || this.getHit() || !this.getHeadChange())
            return;
        this.m_dir *= -1;
        this.m_bodyCheck.onDirUpdate(this.m_dir);
        this.m_spine.onFaceDir(this.m_dir);
        this.onAttackRangeUpdate();
    }

    getHeadChange(): boolean {
        if (this.getKnock())
            return false;
        if (this.CheckHead && this.m_bodyCheck.m_isHead)
            return true;
        if (this.CheckBotHead && this.m_bodyCheck.m_isBotHead && this.m_bodyCheck.m_isBot)
            return true;
        if (this.PathActive) {
            if (this.m_dir == 1 && this.node.position.clone().x > this.m_pathXR)
                return true;
            if (this.m_dir == -1 && this.node.position.clone().x < this.m_pathXL)
                return true;
        }
        return false;
    }

    onAttackRangeUpdate() {
        if (this.m_bodyAttack == null || !this.m_bodyAttack.isValid)
            return;
        this.m_bodyAttack.onDirUpdate(this.m_dir);
    }

    //

    onStateUpdate() {
        let state = BodyState.IDLE;
        //FIND STAGE:
        if (this.getDead())
            state = BodyState.DEAD;
        else if (this.getHit())
            state = BodyState.HIT;
        else if (this.getAttack())
            state = BodyState.NONE;
        else if (this.m_move && this.MoveGroundX != 0)
            state = BodyState.MOVE;
        else
            state = BodyState.IDLE;
        //UPDATE STAGE:
        if (state == this.m_state)
            return;
        this.m_state = state;
        switch (this.m_state) {
            case BodyState.IDLE:
                this.m_bodySpine.onIdle();
                break;
            case BodyState.MOVE:
                this.m_bodySpine.onMove();
                break;
            case BodyState.HIT:
                break;
            case BodyState.DEAD:
                break;
        }
    }

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

    getAttack(): boolean {
        if (this.m_bodyAttack != null)
            return this.m_bodyAttack.m_attack || this.m_bodyAttack.m_continue;
        return false;
    }

    getKnock(): boolean {
        if (this.m_bodyKnock != null)
            return this.m_bodyKnock.m_knock;
        return false;
    }

    onPick() {
        this.m_pick = true;
        this.m_picked = true;
        this.m_lockVelocity = true;
    }

    onThrow() {
        this.m_pick = false;
    }
}