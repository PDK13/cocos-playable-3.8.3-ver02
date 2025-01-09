import { _decorator, Node, CCFloat, CCInteger, CCString, Component, director, Tween, tween, v2, Vec2, CCBoolean } from 'cc';
import { SpineBase } from '../renderer/SpineBase';
import { ShootBase } from './ShootBase';
const { ccclass, property, requireComponent } = _decorator;

class DegTweener {
    Deg: number = 0;
    Base: ShootAim = null;
}

@ccclass('ShootAim')
@requireComponent(ShootBase)
export class ShootAim extends Component {

    @property(Node)
    Bullet: Node = null;
    @property(CCFloat)
    BulletSpeed: number = 5;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnEvent: string = '';
    @property({ group: { name: 'Event' }, type: CCFloat })
    Delay: number = 0;
    @property({ group: { name: 'Event' }, type: CCFloat })
    ShootDelay: number = 0;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 1;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DegFrom: number = 0;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DegTo: number = 180;
    @property({ group: { name: 'Main' }, type: CCFloat })
    DegSpineOffset: number = 0;

    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimActive: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimShoot: string = 'shoot';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimIdleActive: boolean = false;
    @property({ group: { name: 'Anim' }, type: CCString })
    AnimIdle: string = 'idle';
    @property({ group: { name: 'Anim' }, type: CCBoolean })
    AnimIdleLoop: boolean = true;

    @property({ group: { name: 'Bullet' }, type: CCBoolean })
    BulletRotateActive: boolean = false;
    @property({ group: { name: 'Bullet' }, type: CCFloat })
    BulletRotate: number = 180;

    m_degShoot: number = 0;
    m_degSpine: number = 0;
    m_degTweener: DegTweener = null;

    m_spine: SpineBase = null;
    m_shoot: ShootBase = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(SpineBase);
        this.m_shoot = this.getComponent(ShootBase);

        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onAim, this);
    }

    protected start(): void {
        this.m_degShoot = this.DegFrom;
        this.m_degSpine = this.DegFrom + this.DegSpineOffset;

        this.onAimUpdate();
        if (this.Start)
            this.onAim();
    }

    //

    onShoot() {
        if (this.AnimActive) {
            let attackDuration = this.m_spine.onAnimation(this.AnimShoot, false);
            this.scheduleOnce(() => {
                this.m_shoot.onShootVelocityDirection(
                    this.getAimDir(this.m_degShoot, 1),
                    this.Bullet,
                    this.BulletSpeed,
                    this.BulletRotateActive ? this.BulletRotate : null);
            }, Math.min(attackDuration, this.ShootDelay));
            this.scheduleOnce(() => {
                if (this.AnimIdleActive)
                    this.m_spine.onAnimation(this.AnimShoot, this.AnimIdleLoop);
                if (this.EmitEvent != '')
                    director.emit(this.EmitEvent);
            }, attackDuration);
        }
        else {
            this.m_shoot.onShootVelocityDirection(
                this.getAimDir(this.m_degShoot, 1),
                this.Bullet,
                this.BulletSpeed,
                this.BulletRotateActive ? this.BulletRotate : null);
            if (this.EmitEvent != '')
                director.emit(this.EmitEvent);
        }
    }

    onAim() {
        this.m_degShoot = this.DegFrom;
        this.m_degSpine = this.DegFrom + this.DegSpineOffset;
        this.onAimUpdate();
        this.scheduleOnce(() => {
            if (this.m_degTweener != null)
                Tween.stopAllByTarget(this.m_degTweener);
            this.m_degTweener = new DegTweener();
            this.m_degTweener.Deg = this.DegFrom.valueOf();
            this.m_degTweener.Base = this;
            tween(this.m_degTweener)
                .to(this.Duration, { Deg: this.DegTo }, {
                    onUpdate(target: DegTweener) {
                        target.Base.m_degShoot = target.Deg;
                        target.Base.m_degSpine = target.Deg + target.Base.DegSpineOffset;
                        target.Base.onAimUpdate();
                    },
                })
                .call(() => this.onShoot())
                .start();
        }, this.Delay);
        if (this.Once)
            director.off(this.OnEvent, this.onAim, this);
    }

    private onAimUpdate() {
        this.m_spine.onAimDeg(this.m_degSpine);
    }

    private getAimDir(deg: number, length: number): Vec2 {
        let direction = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)));
        return direction.normalize().multiplyScalar(length);
    }
}