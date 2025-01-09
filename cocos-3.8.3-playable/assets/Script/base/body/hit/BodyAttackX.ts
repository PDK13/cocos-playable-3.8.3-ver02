import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, Node, v2, Vec2 } from 'cc';
import { BodyBase } from '../BodyBase';
import { BodyCheckX } from '../physic/BodyCheckX';
import { BaseConstant } from '../../BaseConstant';
import { ShootBase } from '../../shoot/ShootBase';
import { BodySpine } from '../BodySpine';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodyAttackX')
@requireComponent(BodyBase)
@requireComponent(BodyCheckX)
export class BodyAttackX extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Delay: number = 0.02;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayAttack: number = 0.02;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DelayLoop: number = 1;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOutRange: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    StopOnHit: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    ContinueOnHit: boolean = true;

    @property({ group: { name: 'Melee' }, type: CCBoolean })
    Melee: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCBoolean })
    MeleeAuto: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCInteger })
    MeleeHit: number = 1

    @property({ group: { name: 'Range' }, type: CCBoolean })
    Range: boolean = false;
    @property({ group: { name: 'Range' }, type: CCBoolean })
    RangeAuto: boolean = false;
    @property({ group: { name: 'Range' }, type: Node })
    RangeBullet: Node = null;
    @property({ group: { name: 'Range' }, type: CCFloat })
    RangeBulletSpeed: number = 5;
    @property({ group: { name: 'Range' }, type: CCBoolean })
    RangeTargetUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean })
    RangeTargetReset: boolean = true;

    @property({ group: { name: 'Event' }, type: CCString })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    m_dir: number = 0;

    m_attack: boolean = false;
    m_continue: boolean = false;
    m_dead: boolean = false;

    m_meleeAttackUp: boolean = false;

    m_rangeTarget: Node = null;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_bodySpine: BodySpine = null;
    m_shoot: ShootBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_bodySpine = this.getComponent(BodySpine);
        this.m_shoot = this.getComponent(ShootBase);

        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onAttackProgess, this);

        if (this.MeleeAuto)
            this.node.on(this.m_bodyCheck.m_emitMelee, this.onMeleeFoundTarget, this);
        if (this.RangeAuto)
            this.node.on(this.m_bodyCheck.m_emitRange, this.onRangeFoundTarget, this);

        this.node.on(this.m_body.m_emitBodyBaseHit, this.onHit, this);
        this.node.on(this.m_body.m_emitBodyBaseDead, this.onDead, this);
    }

    //

    onHit(value: number, duration: number) {
        if (!this.StopOnHit)
            return;
        this.m_continue = false;
        this.m_attack = false;
        this.unscheduleAllCallbacks();
        if (this.MeleeAuto) {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.onMeleeAttackTargetStart(), this.DelayLoop);
            }, duration);
        }
        if (this.RangeAuto) {
            this.scheduleOnce(() => {
                this.scheduleOnce(() => this.onRangeAttackTargetStart(), this.DelayLoop);
            }, duration);
        }
    }

    onDead() {
        this.m_dead = true;
        this.m_continue = false;
        this.m_attack = false;
        this.unscheduleAllCallbacks();
    }

    //Melee

    private onMeleeFoundTarget(target: Node, stage: boolean) {
        if (this.m_bodyCheck.m_meleeTarget.length > 0) {
            if (!this.m_attack)
                this.onMeleeAttackTargetStart();
            else
                this.m_continue = true;
        }
        else {
            this.m_continue = false;
            if (this.StopOutRange) {
                this.m_attack = false;
                this.unscheduleAllCallbacks();
            }
        }
    }

    onMeleeAttackTargetStart(): boolean {
        if (this.m_bodyCheck.m_meleeTarget.length == 0)
            return false;
        this.onAttackProgess();
        return true;
    }

    onMeleeAttackTargetEmit() {
        this.m_bodyCheck.m_meleeTarget.forEach(target => {
            if (this.m_meleeAttackUp)
                target.emit(BaseConstant.ON_NODE_DEAD, this.node);
            else
                target.emit(BaseConstant.ON_NODE_HIT, this.MeleeHit, this.node);
        });
    }

    onMeleeAttackUp(state: boolean = true) {
        this.m_meleeAttackUp = state;
    }

    //Range

    private onRangeFoundTarget(target: Node, stage: boolean) {
        if (this.m_bodyCheck.m_rangeTarget.length > 0) {
            if (!this.m_attack)
                this.onRangeAttackTargetStart();
            else
                this.m_continue = true;
        }
        else {
            this.m_continue = false;
            if (this.StopOutRange) {
                this.m_attack = false;
                this.unscheduleAllCallbacks();
            }
        }
    }

    onRangeAttackTargetStart(): boolean {
        if (this.m_bodyCheck.m_rangeTarget.length == 0)
            return false;
        this.onAttackProgess();
        return true;
    }

    onRangeAttackTargetShoot() {
        if (this.RangeTargetUpdate && this.m_rangeTarget == null)
            this.m_rangeTarget = this.m_bodyCheck.onRangeTargetNearest();
        if (this.m_rangeTarget != null) {
            this.m_shoot.onShootVelocityTarget(
                this.m_rangeTarget,
                this.RangeBullet,
                this.RangeBulletSpeed,
                0);
            if (this.RangeTargetReset)
                this.m_rangeTarget = null;
        }
        else {
            this.m_shoot.onShootVelocityDeg(
                this.m_bodyCheck.m_dir == 1 ? 0 : 180,
                this.RangeBullet,
                this.RangeBulletSpeed,
                0);
        }
    }

    //Attack

    onAttackProgess(): number {
        if (this.m_dead || this.m_attack)
            return 0;
        this.m_attack = true;
        this.m_continue = true;
        this.scheduleOnce(() => {
            this.scheduleOnce(() => this.onAttackProgessInvoke(), this.DelayAttack);
            this.scheduleOnce(() => {
                this.m_attack = false;
                this.m_bodySpine.m_spine.onAnimationForce(this.m_bodySpine.AnimIdle, true);

                if (!this.Once) {
                    this.scheduleOnce(() => {
                        if (this.m_continue) {
                            if (!this.onMeleeAttackTargetStart())
                                if (!this.onRangeAttackTargetStart()) {
                                    this.m_continue = false;
                                    this.m_attack = false;
                                }
                        }
                    }, this.DelayLoop);
                }
                else {
                    this.m_continue = false;
                    this.m_attack = false;
                }

                if (this.EmitEvent != '')
                    director.emit(this.EmitEvent, this.node);
            }, this.m_bodySpine.m_spine.onAnimationForce(this.m_bodySpine.AnimAttack, false));
        }, this.Delay);
        return this.Delay + this.DelayAttack;
    }

    private onAttackProgessInvoke() {
        if (this.Melee)
            this.onMeleeAttackTargetEmit();
        if (this.Range)
            this.onRangeAttackTargetShoot();
    }

    //Dir

    onDirUpdate(dir: number) {
        if (dir > 0)
            dir = 1;
        else if (dir < 0)
            dir = -1;
        else return;

        this.m_dir = dir;

        this.m_continue = false;
        if (this.StopOutRange) {
            this.m_attack = false;
            this.unscheduleAllCallbacks();
        }
    }
}