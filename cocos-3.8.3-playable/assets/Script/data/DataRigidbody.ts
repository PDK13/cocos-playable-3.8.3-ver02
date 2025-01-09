import { _decorator, ERigidBody2DType, RigidBody2D, Vec2 } from 'cc';

export class DataRigidbody {

    group: number;
    enabledContactListener: boolean;
    bullet: boolean;
    type: ERigidBody2DType;
    allowSleep: boolean;
    gravityScale: number;
    linearDamping: number;
    angularDamping: number;
    linearVelocity: Vec2;
    angularVelocity: number;
    fixedRotation: boolean;
    awakeOnLoad: boolean;

    constructor(component: RigidBody2D) {
        this.group = component.group;
        this.enabledContactListener = component.enabledContactListener;
        this.bullet = component.bullet;
        this.type = component.type;
        this.allowSleep = component.allowSleep;
        this.gravityScale = component.gravityScale;
        this.linearDamping = component.linearDamping;
        this.angularDamping = component.angularDamping;
        this.linearVelocity = component.linearVelocity;
        this.angularVelocity = component.angularVelocity;
        this.fixedRotation = component.fixedRotation;
        this.awakeOnLoad = component.awakeOnLoad;
    }

    onUpdate(component: RigidBody2D){
        component.group = this.group;
        component.enabledContactListener = this.enabledContactListener;
        component.bullet = this.bullet;
        component.type = this.type;
        component.allowSleep = this.allowSleep;
        component.gravityScale = this.gravityScale;
        component.linearDamping = this.linearDamping;
        component.angularDamping = this.angularDamping;
        component.linearVelocity = this.linearVelocity;
        component.angularVelocity = this.angularVelocity;
        component.fixedRotation = this.fixedRotation;
        component.awakeOnLoad = this.awakeOnLoad;
    }
}