import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, Node, sp, v2, v3, Vec2 } from 'cc';
import { BodyBase } from '../BodyBase';
import { BodyCheckX } from '../physic/BodyCheckX';
import { ConstantBase } from '../../ConstantBase';
import { ShootBase } from '../../shoot/ShootBase';
import { SpineBase } from '../../renderer/SpineBase';
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
    @property({ group: { name: 'Melee' }, type: CCBoolean, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeAuto: boolean = false;
    @property({ group: { name: 'Melee' }, type: CCInteger, visible(this: BodyAttackX) { return this.Melee; } })
    MeleeHit: number = 1

    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeAuto: boolean = false;
    @property({ group: { name: 'Range' }, type: Node, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeBullet: Node = null;
    @property({ group: { name: 'Range' }, type: CCFloat, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeBulletSpeed: number = 5;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeTargetUpdate: boolean = true;
    @property({ group: { name: 'Range' }, type: CCBoolean, visible(this: BodyAttackX) { return this.getComponent(ShootBase) != null; } })
    RangeTargetReset: boolean = true;

    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttackReady: string = 'attack_ready';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttackHold: string = 'attack_hold';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimAttack: string = 'attack';
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';

    @property({ group: { name: 'Aim' }, type: CCBoolean })
    Aim: boolean = false;
    @property({ group: { name: 'Aim' }, type: CCString, visible(this: BodyAttackX) { return this.Aim; } })
    AimAnim: string = 'attack_aim';
    @property({ group: { name: 'Aim' }, type: CCInteger, visible(this: BodyAttackX) { return this.Aim; } })
    AimAnimIndex: number = 1;
    @property({ group: { name: 'Aim' }, type: CCString, visible(this: BodyAttackX) { return this.Aim; } })
    AimBone: string = 'aim_bone';
    @property({ group: { name: 'Aim' }, type: Node, visible(this: BodyAttackX) { return this.Aim; } })
    AimFrom: Node = null;

    m_dir: number = 0;

    m_attack: boolean = false;
    m_continue: boolean = false;
    m_dead: boolean = false;

    m_meleeAttackUp: boolean = false;

    m_rangeTarget: Node = null;
    m_aimBone: sp.spine.Bone;
    m_aimPosPrimary: Vec2;

    m_body: BodyBase = null;
    m_bodyCheck: BodyCheckX = null;
    m_shoot: ShootBase = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_bodyCheck = this.getComponent(BodyCheckX);
        this.m_shoot = this.getComponent(ShootBase);
        this.m_spine = this.getComponent(SpineBase);

        if (this.MeleeAuto)
            this.node.on(this.m_bodyCheck.m_emitMelee, this.onMeleeFoundTarget, this);
        if (this.RangeAuto)
            this.node.on(this.m_bodyCheck.m_emitRange, this.onRangeFoundTarget, this);

        if (this.Aim)
            this.onAimInit(this.AimAnim, this.AimAnimIndex, this.AimBone, this.AimFrom);

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
                target.emit(ConstantBase.ON_NODE_DEAD, this.node);
            else
                target.emit(ConstantBase.ON_NODE_HIT, this.MeleeHit, this.node);
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
        if (this.m_shoot == null)
            return;
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
                this.m_spine.onAnimationForce(this.AnimIdle, true);

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
            }, this.m_spine.onAnimationForce(this.AnimAttack, false));
        }, this.Delay);
        return this.Delay + this.DelayAttack;
    }

    private onAttackProgessInvoke() {
        if (this.Melee)
            this.onMeleeAttackTargetEmit();
        if (this.m_shoot != null)
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

    //Anim

    onAimInit(anim: string, index: number, bone: string, from: Node) {
        this.AimAnim = anim;
        this.AimAnimIndex = index;
        this.m_aimBone = this.m_spine.Spine.findBone(bone);
        this.m_aimPosPrimary = v2(this.m_aimBone.x, this.m_aimBone.y);
        this.AimFrom = from;
    }

    onAimTarget(target: Node) {
        if (this.m_aimBone == null)
            return;
        let aimPosition = target.worldPosition.clone().subtract(this.node.worldPosition.clone());
        this.onAim(v2(aimPosition.x, aimPosition.y));
    }

    onAimDeg(deg: number) {
        if (this.m_aimBone == null)
            return;
        let direction = v3(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)), 0);
        direction = direction.clone().normalize().multiplyScalar(200);
        let aimPosition = this.AimFrom.position.clone().add(direction);
        this.onAim(v2(aimPosition.x, aimPosition.y));
    }

    onAim(posLocal: Vec2) {
        if (this.m_aimBone == null)
            return;
        //Not used this on update() or lateUpdate() to avoid some bug with caculate position
        let posLocalSpine = new sp.spine.Vector2(posLocal.clone().x, posLocal.clone().y);
        this.m_aimBone.parent.worldToLocal(posLocalSpine);
        this.m_aimBone.x = posLocalSpine.x;
        this.m_aimBone.y = posLocalSpine.y;
        this.m_spine.Spine._skeleton.updateWorldTransform();
        this.m_spine.Spine.setAnimation(this.AimAnimIndex, this.AimAnim, true);
    }

    onUnAim() {
        if (this.m_aimBone == null)
            return;
        this.m_spine.onAnimationEmty(this.AimAnimIndex, 0.02);
        this.m_aimBone.x = this.m_aimPosPrimary.x;
        this.m_aimBone.y = this.m_aimPosPrimary.y;
    }

    onAttackReady(): number {
        return this.m_spine.onAnimation(this.AnimAttackReady, false);
    }

    onAttackHold(): number {
        return this.m_spine.onAnimation(this.AnimAttackHold, true);
    }
}