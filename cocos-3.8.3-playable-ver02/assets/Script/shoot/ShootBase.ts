import { _decorator, CCBoolean, CCFloat, Component, instantiate, Node, RigidBody2D, v2, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShootBase')
export class ShootBase extends Component {

    @property(Node)
    Bullet: Node = null;
    @property(CCFloat)
    BulletSpeed: number = 5;

    @property({ group: { name: 'Node' }, type: Node })
    ShootFrom: Node = null;
    @property({ group: { name: 'Node' }, type: Node })
    ShootSpawm: Node = null;

    @property({ group: { name: 'Hold' }, type: CCBoolean })
    ShootHold: boolean = false;
    @property({ group: { name: 'Hold' }, type: CCFloat })
    ShootDelay: number = 0.5;

    m_delay: boolean = false;

    protected start(): void {
        if (this.ShootFrom == null)
            this.ShootFrom = this.Bullet;
        if (this.ShootSpawm == null)
            this.ShootSpawm = this.node.parent;
    }

    onShootVelocityTarget(target: Node, bullet?: Node, speed?: number, rotate?: number): void {
        if (!this.m_delay) {
            this.onShootVelocity(this.getVelocityTarget(target, speed ?? this.BulletSpeed), bullet, rotate);
            if (this.ShootHold) {
                this.m_delay = true;
                this.scheduleOnce(() => this.m_delay = false, this.ShootDelay);
            }
        }
    }

    onShootVelocityWorldPos(worldPos: Vec2, bullet?: Node, speed?: number, rotate?: number): void {
        if (!this.m_delay) {
            this.onShootVelocity(this.getVelocityWorldPos(worldPos, speed ?? this.BulletSpeed), bullet, rotate);
            if (this.ShootHold) {
                this.m_delay = true;
                this.scheduleOnce(() => this.m_delay = false, this.ShootDelay);
            }
        }
    }

    onShootVelocityDirection(direction: Vec2, bullet?: Node, speed?: number, rotate?: number): void {
        if (!this.m_delay) {
            this.onShootVelocity(this.getVelocityDirection(direction, speed ?? this.BulletSpeed), bullet, rotate);
            if (this.ShootHold) {
                this.m_delay = true;
                this.scheduleOnce(() => this.m_delay = false, this.ShootDelay);
            }
        }
    }

    onShootVelocityDeg(deg: number, bullet?: Node, speed?: number, rotate?: number) {
        if (!this.m_delay) {
            this.onShootVelocity(this.getVelocityDeg(deg, speed ?? this.BulletSpeed), bullet, rotate);
            if (this.ShootHold) {
                this.m_delay = true;
                this.scheduleOnce(() => this.m_delay = false, this.ShootDelay);
            }
        }
    }

    getVelocityTarget(target: Node, length: number): Vec2 {
        var direction = v2(
            target.worldPosition.clone().x - this.ShootFrom.worldPosition.clone().x,
            target.worldPosition.clone().y - this.ShootFrom.worldPosition.clone().y + 100).normalize();
        return direction.clone().multiplyScalar(length);
    }

    getVelocityWorldPos(worldPos: Vec2, length: number): Vec2 {
        var direction = v2(
            worldPos.x - this.ShootFrom.worldPosition.clone().x,
            worldPos.y - this.ShootFrom.worldPosition.clone().y + 100).normalize();
        return direction.clone().multiplyScalar(length);
    }

    getVelocityDirection(direction: Vec2, length: number): Vec2 {
        return direction.clone().normalize().multiplyScalar(length);
    }

    getVelocityDeg(deg: number, length: number): Vec2 {
        let direction = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180))).normalize();
        return direction.clone().multiplyScalar(length);
    }

    onShootVelocity(velocity: Vec2, bullet?: Node, rotate?: number) {
        var bulletClone = instantiate(bullet ?? this.Bullet);
        bulletClone.setParent(this.ShootSpawm);
        bulletClone.worldPosition = this.ShootFrom.worldPosition.clone();
        if (rotate != null) {
            //Rotate default value is 180 recommend
            var bulletRotate = Math.atan2(velocity.y, velocity.x) * 57.29578 + rotate;
            bulletClone.setRotationFromEuler(v3(0, 0, bulletRotate));
        }
        this.scheduleOnce(() => {
            bulletClone.active = true;
            bulletClone.getComponent(RigidBody2D).linearVelocity = velocity;
        }, 0.02);
    }

    //

    onShootInstant(posWorld: Vec2, bullet?: Node, rotate?: number) {
        var bulletClone = instantiate(bullet ?? this.Bullet);
        bulletClone.setParent(this.ShootSpawm);
        bulletClone.worldPosition = v3(posWorld.x, posWorld.y, bulletClone.worldPosition.clone().z);
        if (rotate != null) {
            //Rotate default value is 180 recommend
            let velocity = this.getVelocityWorldPos(posWorld, 1);
            var bulletRotate = Math.atan2(velocity.y, velocity.x) * 57.29578 + rotate;
            bulletClone.setRotationFromEuler(v3(0, 0, bulletRotate));
        }
        this.scheduleOnce(() => {
            bulletClone.active = true;
        }, 0.02);
    }
}