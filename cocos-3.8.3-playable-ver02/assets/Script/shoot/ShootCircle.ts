import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, Node, RigidBody, RigidBody2D } from 'cc';
import { ShootBase } from './ShootBase';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ShootCircle')
@requireComponent(ShootBase)
export class ShootCircle extends Component {

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
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEvent: string = '';

    @property({ group: { name: 'Shoot' }, type: CCFloat })
    Deg: number = 0;
    @property({ group: { name: 'Shoot' }, type: CCFloat })
    Count: number = 8;
    @property({ group: { name: 'Shoot' }, type: CCFloat })
    DegOffset: number = 45;

    @property({ group: { name: 'Loop' }, type: CCBoolean })
    Loop: boolean = false;
    @property({ group: { name: 'Loop' }, type: CCFloat })
    DelayLoop: number = 1;

    @property({ group: { name: 'Bullet' }, type: CCBoolean })
    BulletRotateActive: boolean = false;
    @property({ group: { name: 'Bullet' }, type: CCFloat })
    BulletRotate: number = 180;

    m_shoot: ShootBase = null;

    protected onLoad(): void {
        this.m_shoot = this.getComponent(ShootBase);

        if (this.OnEvent != '')
            director.on(this.OnEvent, this.onShoot, this);
    }

    protected start(): void {
        if (this.Start)
            this.scheduleOnce(() => this.onShoot(), this.Delay);
    }

    //

    onShoot() {
        for (let i = 0; i < this.Count; i++)
            this.m_shoot.onShootVelocityDeg(
                this.Deg + this.DegOffset * i,
                this.Bullet,
                this.BulletSpeed,
                this.BulletRotateActive ? this.BulletRotate : null);
        if (this.Loop)
            this.scheduleOnce(() => this.onShoot(), this.DelayLoop);
        if (this.EmitEvent != '')
            director.emit(this.EmitEvent);
        if (this.Once)
            director.off(this.OnEvent, this.onShoot, this);
    }
}