import { _decorator, Node, AudioSource, CCBoolean, CCFloat, CCInteger, CCString, Collider2D, Component, director, instantiate, RigidBody2D, Sprite, Vec2, v2, v3, UITransform } from 'cc';
import { BaseConstant } from '../BaseConstant';
import { ValueBar } from '../value/ValueBar';
const { ccclass, property } = _decorator;

@ccclass('BodyBase')
export class BodyBase extends Component {

    @property({ group: { name: 'Body' }, type: CCBoolean })
    Protect: boolean = false;
    @property({ group: { name: 'Body' }, type: CCInteger, visible(this: BodyBase) { return !this.Protect; } })
    HitPoint: number = 1;
    @property({ group: { name: 'Body' }, type: CCFloat })
    HitDelay: number = 0.2;
    @property({ group: { name: 'Body' }, type: CCBoolean })
    HitFixed: boolean = false;

    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitHitDead: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    EmitHit: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitDead: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitDestroy: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    EmitFull: boolean = true;

    @property({ group: { name: 'Destroy' }, type: CCBoolean })
    DestroyNode: boolean = false;
    @property({ group: { name: 'Destroy' }, type: CCFloat, visible(this: BodyBase) { return this.DestroyNode; } })
    DestroyNodeDelay: number = 0;
    @property({ group: { name: 'Destroy' }, type: CCBoolean })
    DestroyBody: boolean = false;
    @property({ group: { name: 'Destroy' }, type: CCFloat, visible(this: BodyBase) { return this.DestroyBody; } })
    DestroyBodyDelay: number = 0;
    @property({ group: { name: 'Destroy' }, type: CCBoolean, visible(this: BodyBase) { return this.DestroyBody; } })
    DestroyRigidbody: boolean = true;
    @property({ group: { name: 'Destroy' }, type: [CCInteger], visible(this: BodyBase) { return this.DestroyBody; } })
    TagDestroyCollider: number[] = [200];

    @property({ group: { name: 'Effect' }, type: CCBoolean })
    EffectFixed: boolean = false;
    @property({ group: { name: 'Effect' }, type: Vec2, visible(this: BodyBase) { return this.EffectFixed; } })
    EffectOffset: Vec2 = v2();
    @property({ group: { name: 'Effect' }, type: Node })
    EffectCentre: Node = null;
    @property({ group: { name: 'Effect' }, type: Node })
    EffectHit: Node = null;
    @property({ group: { name: 'Effect' }, type: Node })
    EffectDead: Node = null;
    @property({ group: { name: 'Effect' }, type: Node })
    EffectDestroy: Node = null;
    @property({ group: { name: 'Effect' }, type: Node })
    EffectSpawm: Node = null;

    @property({ group: { name: 'Camera' }, type: CCBoolean })
    ShakeHit: boolean = false;
    @property({ group: { name: 'Camera' }, type: CCBoolean })
    ShakeDead: boolean = false;

    @property({ group: { name: 'Option' }, type: CCString })
    Name: string = '';
    @property({ group: { name: 'Option' }, type: ValueBar })
    ValueBar: ValueBar = null;
    @property({ group: { name: 'Option' }, type: Node })
    BarMask: Node = null;
    @property({ group: { name: 'Option' }, type: AudioSource })
    AudioHit: AudioSource = null;
    @property({ group: { name: 'Option' }, type: AudioSource })
    AudioDead: AudioSource = null;

    readonly m_emitBodyBaseHit: string = 'emit-body-base-hit';
    readonly m_emitBodyBaseDead: string = 'emit-body-base-dead';

    m_dead: boolean = false;
    m_hit: boolean = false;
    m_hitPointCurrent: number;

    m_rigidbody: RigidBody2D = null;
    m_destroyCollider: Collider2D[] = [];
    m_maskSprite: Sprite = null;
    m_maskTransform: UITransform = null;
    m_maskTransformX: number;

    protected onLoad(): void {
        this.m_rigidbody = this.getComponent(RigidBody2D);

        if (this.BarMask != null) {
            this.m_maskSprite = this.BarMask.getComponent(Sprite);
            this.m_maskTransform = this.BarMask.getComponent(UITransform);
        }

        this.node.on(BaseConstant.ON_NODE_HIT, this.onHit, this);
        this.node.on(BaseConstant.ON_NODE_DEAD, this.onDead, this);

        let collider = this.getComponents(Collider2D);
        collider.forEach(colliderCheck => {
            let tagIndex = this.TagDestroyCollider.findIndex(t => t == colliderCheck.tag);
            if (tagIndex >= 0)
                this.m_destroyCollider.push(colliderCheck as Collider2D)
        })
    }

    protected start(): void {
        this.m_hitPointCurrent = this.HitPoint;
        if (this.BarMask != null)
            this.m_maskTransformX = this.m_maskTransform.contentSize.clone().x;
        if (this.EffectCentre == null)
            this.EffectCentre = this.node;
        if (this.ValueBar != null ? !this.ValueBar.Hide : false) {
            this.ValueBar.onName(this.Name);
            this.ValueBar.onUpdate(this.m_hitPointCurrent, this.HitPoint);
        }
        if (this.EffectSpawm == null)
            this.EffectSpawm = this.node.parent;
    }

    protected onDestroy(): void {
        if (this.EmitDestroy != '')
            director.emit(this.EmitDestroy, this.node);
    }

    onHit(hit: number, from: Node) {
        if (this.m_dead)
            return;

        if (this.m_hit)
            return;
        this.m_hit = true;
        this.scheduleOnce(() => {
            this.m_hit = false;
        }, this.HitDelay);

        if (!this.Protect) {
            if (this.HitFixed)
                this.m_hitPointCurrent -= 1;
            else
                this.m_hitPointCurrent -= Math.max(hit, 1);
            if (this.m_hitPointCurrent < 0)
                this.m_hitPointCurrent = 0;
            this.onBarUpdate();
        }

        if (this.m_hitPointCurrent <= 0)
            this.onDead(from);
        else {
            this.onHitEffect();

            if (this.ShakeHit)
                director.emit(BaseConstant.CAMERA_EFFECT_SHAKE_ONCE);

            this.node.emit(this.m_emitBodyBaseHit, hit, from);
            if (this.EmitHit != '') {
                if (this.EmitFull)
                    director.emit(this.EmitHit, this.m_hitPointCurrent, this.HitPoint);
                else
                    director.emit(this.EmitHit);
            }
        }
    }

    onDead(from: Node) {
        if (this.m_dead)
            return;
        this.unscheduleAllCallbacks();
        this.m_dead = true;

        this.onDeadEffect();

        if (this.ShakeDead)
            director.emit(BaseConstant.CAMERA_EFFECT_SHAKE_ONCE);

        this.onDeadDestroy();

        if (this.EmitHitDead) {
            if (this.EmitHit != '') {
                if (this.EmitFull)
                    director.emit(this.EmitHit, this.m_hitPointCurrent, this.HitPoint);
                else
                    director.emit(this.EmitHit);
            }
        }

        this.node.emit(this.m_emitBodyBaseDead, from);
        if (this.EmitDead != '') {
            if (this.EmitFull)
                director.emit(this.EmitDead, this.node);
            else
                director.emit(this.EmitDead);
        }

        this.node.off(BaseConstant.ON_NODE_HIT, this.onHit, this);
        this.node.off(BaseConstant.ON_NODE_DEAD, this.onDead, this);
    }

    onBarUpdate() {
        if (this.BarMask != null) {
            if (this.m_maskSprite != null ? this.m_maskSprite.type == Sprite.Type.FILLED : false)
                this.m_maskSprite.fillRange = 1.0 * this.m_hitPointCurrent / this.HitPoint;
            else {
                let size = this.m_maskTransform.contentSize.clone();
                size.x = this.m_maskTransformX * (1.0 * this.m_hitPointCurrent / this.HitPoint);
                this.m_maskTransform.contentSize = size;
            }
        }
        if (this.ValueBar != null) {
            this.ValueBar.onName(this.Name);
            this.ValueBar.onUpdate(this.m_hitPointCurrent, this.HitPoint);
        }
    }

    //Destroy

    private onDeadDestroy() {
        if (this.DestroyNode) {
            this.scheduleOnce(() => {
                this.onDestroyEffect();
                this.node.destroy();
            }, Math.max(this.DestroyNodeDelay, 0.02));
            if (this.DestroyBody && this.DestroyNodeDelay < this.DestroyBodyDelay)
                return;
        }

        if (this.DestroyBody)
            this.scheduleOnce(() => {
                if (this.DestroyRigidbody)
                    this.m_rigidbody.destroy();
                this.m_destroyCollider.forEach(colliderCheck => {
                    colliderCheck.destroy();
                });
            }, Math.max(this.DestroyBodyDelay, 0.02));
    }

    //Effect

    private onHitEffect() {
        if (this.AudioHit != null)
            this.AudioHit.play();
        if (this.EffectHit != null) {
            let effectClone = instantiate(this.EffectHit);
            effectClone.setParent(this.EffectSpawm);
            effectClone.active = true;
            if (this.EffectFixed) {
                let offset = v3(this.EffectOffset.x, this.EffectOffset.y, 0);
                effectClone.worldPosition = this.EffectCentre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.EffectHit.worldPosition;
        }
    }

    private onDeadEffect() {
        if (this.AudioDead != null)
            this.AudioDead.play();
        if (this.EffectDead != null) {
            let effectClone = instantiate(this.EffectDead);
            effectClone.setParent(this.EffectSpawm);
            effectClone.active = true;
            if (this.EffectFixed) {
                let offset = v3(this.EffectOffset.x, this.EffectOffset.y, 0);
                effectClone.worldPosition = this.EffectCentre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.EffectDead.worldPosition;
        }
    }

    private onDestroyEffect() {
        if (this.EffectDestroy != null) {
            let effectClone = instantiate(this.EffectDestroy);
            effectClone.setParent(this.EffectSpawm);
            effectClone.active = true;
            if (this.EffectFixed) {
                let offset = v3(this.EffectOffset.x, this.EffectOffset.y, 0);
                effectClone.worldPosition = this.EffectCentre.worldPosition.clone().add(offset);
            }
            else
                effectClone.worldPosition = this.EffectDestroy.worldPosition;
        }
    }
}