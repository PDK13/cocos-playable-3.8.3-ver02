import { _decorator, AudioSource, CCBoolean, CCInteger, CCString, Component } from 'cc';
import { BodyBase } from './BodyBase';
import { SpineBase } from '../renderer/SpineBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BodySpine')
@requireComponent(BodyBase)
@requireComponent(SpineBase)
export class BodySpine extends Component {

    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimIdleActive: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: BodySpine) { return this.AnimIdleActive; } })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: BodySpine) { return this.AnimIdleActive; } })
    AnimIdleLoop: boolean = true;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimHitActive: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: BodySpine) { return this.AnimHitActive; } })
    AnimHit: string = 'hit';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimDeadActive: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString, visible(this: BodySpine) { return this.AnimDeadActive; } })
    AnimDead: string = 'dead';
    @property({ group: { name: 'Main' }, type: CCBoolean, visible(this: BodySpine) { return this.AnimDeadActive; } })
    AnimDeadLoop: boolean = true;
    @property({ group: { name: 'Main' }, type: CCString })
    AnimFinish: string = 'win';
    @property({ group: { name: 'Main' }, type: CCBoolean })
    AnimFinishLoop: boolean = true;

    @property({ group: { name: 'Other' }, type: CCString })
    AnimMove: string = 'move';
    @property({ group: { name: 'Other' }, type: CCString })
    AnimPush: string = 'push';
    @property({ group: { name: 'Other' }, type: CCString })
    AnimAirOn: string = 'air_on';
    @property({ group: { name: 'Other' }, type: CCString })
    AnimAirOff: string = 'air_off';
    @property({ group: { name: 'Other' }, type: CCString })
    AnimDash: string = 'dash';

    @property({ group: { name: 'Attack' }, type: CCString })
    AnimAttackReady: string = 'attack_ready';
    @property({ group: { name: 'Attack' }, type: CCString })
    AnimAttackHold: string = 'attack_hold';
    @property({ group: { name: 'Attack' }, type: CCString })
    AnimAttack: string = 'attack';

    @property({ group: { name: 'Pick' }, type: CCString })
    AnimPick: string = 'pick';
    @property({ group: { name: 'Pick' }, type: CCString })
    AnimPickLoop: string = 'pick_loop';
    @property({ group: { name: 'Pick' }, type: CCString })
    AnimThrow: string = 'throw';
    @property({ group: { name: 'Pick' }, type: CCInteger })
    AnimPickIndex: number = 2;

    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioJump: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioHurt: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioFinish: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioDead: AudioSource = null;
    @property({ group: { name: 'Audio' }, type: AudioSource })
    AudioDash: AudioSource = null;

    m_hit: boolean = false;
    m_dead: boolean = false;

    m_body: BodyBase = null;
    m_spine: SpineBase = null;

    protected onLoad(): void {
        this.m_body = this.getComponent(BodyBase);
        this.m_spine = this.getComponent(SpineBase);

        this.node.on(this.m_body.m_emitBodyBaseHit, this.onHit, this);
        this.node.on(this.m_body.m_emitBodyBaseDead, this.onDead, this);
    }

    //

    onViewDirection(direction: number): boolean {
        let change = false;
        if (this.m_spine != null) {
            if (direction == -1 && this.m_spine.Spine._skeleton.scaleX > 0)
                change = true;
            else if (direction == 1 && this.m_spine.Spine._skeleton.scaleX < 0)
                change = true;
            this.m_spine.onFaceDir(direction);
        }
        return change;
    }

    //

    onIdle(): number {
        if (!this.AnimIdleActive)
            return 0;
        if (this.m_hit)
            return 0;
        return this.m_spine.onAnimation(this.AnimIdle, this.AnimIdleLoop);
    }

    onHit(): number {
        if (!this.AnimHitActive)
            return 0;
        if (this.AudioHurt != null)
            this.AudioHurt.play();
        this.m_hit = true;
        let animHitDuration = this.m_spine.onAnimation(this.AnimHit, false);
        this.scheduleOnce(() => {
            this.m_hit = false;
            this.onIdle();
        }, animHitDuration);
        return animHitDuration;
    }

    onDead(): number {
        if (this.AudioDead != null)
            this.AudioDead.play();
        this.m_dead = true;
        if (!this.AnimDeadActive)
            return 0;
        return this.m_spine.onAnimation(this.AnimDead, this.AnimDeadLoop);
    }

    onMove(): number {
        return this.m_spine.onAnimation(this.AnimMove, true);
    }

    onPush(): number {
        return this.m_spine.onAnimation(this.AnimPush, true);
    }

    onAirOn(): number {
        if (this.AudioJump != null)
            this.AudioJump.play();
        return this.m_spine.onAnimation(this.AnimAirOn, true);
    }

    onAirOff(): number {
        return this.m_spine.onAnimation(this.AnimAirOff, true);
    }

    onComplete(): number {
        if (this.AudioFinish != null)
            this.AudioFinish.play();
        return this.m_spine.onAnimation(this.AnimFinish, this.AnimFinishLoop);
    }

    onDash(): number {
        return this.m_spine.onAnimation(this.AnimDash, true);
    }

    //ATTACK:

    onAttackReady(): number {
        return this.m_spine.onAnimation(this.AnimAttackReady, false);
    }

    onAttackHold(): number {
        return this.m_spine.onAnimation(this.AnimAttackHold, true);
    }

    //PICK:

    onPick(): number {
        return this.m_spine.onAnimationIndex(this.AnimPickIndex, this.AnimPick, false);
    }

    onPickLoop(): number {
        return this.m_spine.onAnimationIndex(this.AnimPickIndex, this.AnimPickLoop, true);
    }

    onThrow(): number {
        return this.m_spine.onAnimationIndex(this.AnimPickIndex, this.AnimThrow, false);
    }

    onPickEmty() {
        this.m_spine.onAnimationClear(this.AnimPickIndex);
    }
}