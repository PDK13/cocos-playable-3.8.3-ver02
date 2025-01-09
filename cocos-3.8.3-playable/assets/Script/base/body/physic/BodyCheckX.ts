import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, director, Enum, ERaycast2DType, IPhysics2DContact, macro, math, Node, PhysicsSystem2D, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { BodyPlatformX } from './BodyPlatformX';
import { BaseConstant } from '../../BaseConstant';
const { ccclass, property, requireComponent } = _decorator;

export enum BodyType {
    STICK,
    BALL,
}
Enum(BodyType)

@ccclass('BodyCheckX')
@requireComponent(RigidBody2D)
export class BodyCheckX extends Component {

    @property({ type: BodyType })
    Type: BodyType = BodyType.STICK;

    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    DirMelee: boolean = true;
    @property({ group: { name: 'Target' }, type: CCBoolean, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    DirRange: boolean = true;

    @property({ group: { name: 'Self' }, type: CCInteger })
    TagBody: number = 100;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagTop: number = 99;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagBot: number = 98;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagHead: number = 97;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagBotHead: number = 96;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagMelee: number = 101;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagRange: number = 102;
    @property({ group: { name: 'Self' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagInteraction: number = 103;

    @property({ group: { name: 'Other' }, type: CCInteger })
    TagGround: number = -1;
    @property({ group: { name: 'Other' }, type: CCInteger })
    TagPlatform: number = -2;
    @property({ group: { name: 'Other' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagTarget: number = 200;
    @property({ group: { name: 'Other' }, type: CCInteger, visible(this: BodyCheckX) { return this.Type == BodyType.STICK; } })
    TagBox: number = 300;

    m_dir: number = 1;

    m_countBot: number = 0;
    m_countHead: number = 0;
    m_countBotHead: number = 0;

    m_isBot: boolean = false;
    m_isHead: boolean = false;
    m_isBotHead: boolean = false;

    m_offsetHeadX: number;
    m_offsetBotHeadX: number;
    m_offsetMeleeX: number;
    m_offsetRangeX: number;

    m_botTarget: Node = null;
    m_meleeTarget: Node[] = [];
    m_rangeTarget: Node[] = [];
    m_interacteTarget: Node[] = [];

    m_updateSchedule: Function = null;

    readonly m_emitBot: string = 'emit-body-bot';
    readonly m_emitMelee: string = 'emit-body-melee';
    readonly m_emitRange: string = 'emit-body-range';
    readonly m_emitInteracte: string = 'emit-body-interacte';

    m_colliderBody: Collider2D = null;
    m_colliderBot: Collider2D = null;
    m_colliderTop: Collider2D = null;
    m_colliderHead: Collider2D = null;
    m_colliderBotHead: Collider2D = null;
    m_colliderMelee: Collider2D = null;
    m_colliderRange: Collider2D = null;
    m_colliderinteracte: Collider2D = null;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        switch (this.Type) {
            case BodyType.STICK:
                for (let i = 0; i < colliders.length; i++) {
                    let collider = colliders[i];
                    switch (collider.tag) {
                        case this.TagBody:
                            this.m_colliderBody = collider;
                            break;
                        case this.TagTop:
                            this.m_colliderTop = collider;
                            break;
                        case this.TagBot:
                            this.m_colliderBot = collider;
                            break;
                        case this.TagHead:
                            this.m_colliderHead = collider;
                            break;
                        case this.TagBotHead:
                            this.m_colliderBotHead = collider;
                            break;
                        case this.TagMelee:
                            this.m_colliderMelee = collider;
                            break;
                        case this.TagRange:
                            this.m_colliderRange = collider;
                            break;
                        case this.TagInteraction:
                            this.m_colliderinteracte = collider;
                            break;
                        default:
                            continue;
                    }
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                };
                break;
            case BodyType.BALL:
                for (let i = 0; i < colliders.length; i++) {
                    let collider = colliders[i];
                    switch (collider.tag) {
                        case this.TagBody:
                            this.m_colliderBody = collider;
                            break;
                        default:
                            continue;
                    }
                };
                this.m_updateSchedule = () => {
                    //Check Ground 
                    let p1 = this.node.worldPosition;
                    let p2 = p1.clone().subtract(v3(0, this.m_colliderBody.worldAABB.size.clone().x + 1, 0));
                    const results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Any);
                    let state = this.m_isBot;
                    if (results.length < 1) {
                        //Not collide with any collision!
                        this.m_isBot = false;
                    }
                    else {
                        //Collide with aleast 1 collision!
                        for (let i = 0; i < results.length; i++) {
                            let out = false;
                            switch (results[i].collider.tag) {
                                case this.TagGround:
                                case this.TagPlatform:
                                    this.m_isBot = true;
                                    out = true;
                                    break;
                                default:
                                    this.m_isBot = false;
                                    break;
                            }
                            if (out)
                                break;
                        }
                    }
                    if (state != this.m_isBot)
                        this.node.emit(this.m_emitBot, this.m_isBot);
                }
                this.schedule(this.m_updateSchedule, PhysicsSystem2D.instance.fixedTimeStep, macro.REPEAT_FOREVER, 0);
                break;
        }
    }

    protected start(): void {
        switch (this.Type) {
            case BodyType.STICK:
                if (this.m_colliderHead != null)
                    this.m_offsetHeadX = this.m_colliderHead.offset.x;
                if (this.m_colliderBotHead != null)
                    this.m_offsetBotHeadX = this.m_colliderBotHead.offset.x;
                if (this.m_colliderMelee != null)
                    this.m_offsetMeleeX = this.m_colliderMelee.offset.x;
                if (this.m_colliderRange != null)
                    this.m_offsetRangeX = this.m_colliderRange.offset.x;
                break;
            case BodyType.BALL:
                break;
        }
    }

    //

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                break;
            case this.TagTop:
                break;
            case this.TagBot:
                if (otherCollider.sensor)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        if (this.m_countBot == 0)
                            this.m_botTarget = otherCollider.node;
                        this.m_countBot++;
                        let state = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (state != this.m_isBot)
                            this.node.emit(this.m_emitBot, this.m_isBot);
                        break;
                }
                break;
            case this.TagHead:
                if (otherCollider.sensor)
                    break;
                if (otherCollider.getComponent(BodyPlatformX) != null)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                        this.m_countHead++;
                        this.m_isHead = this.m_countHead > 0;
                        break;
                }
            case this.TagBotHead:
                if (otherCollider.sensor)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        this.m_countBotHead++;
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;
            case this.TagMelee:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_meleeTarget.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_meleeTarget.push(otherCollider.node);
                        this.node.emit(this.m_emitMelee, otherCollider.node, true);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_rangeTarget.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_rangeTarget.push(otherCollider.node);
                        this.node.emit(this.m_emitRange, otherCollider.node, true);
                        break;
                }
                break;
            case this.TagInteraction:
                switch (otherCollider.tag) {
                    case this.TagBox:
                        let index = this.m_interacteTarget.findIndex(t => t == otherCollider.node);
                        if (index >= 0)
                            break;
                        this.m_interacteTarget.push(otherCollider.node);
                        this.node.emit(this.m_emitInteracte, otherCollider.node, true);
                        break;
                }
                break;
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        switch (selfCollider.tag) {
            case this.TagBody:
                break;
            case this.TagTop:
                break;
            case this.TagBot:
                if (otherCollider.sensor)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        this.m_countBot = math.clamp(this.m_countBot - 1, 0, this.m_countBot);
                        if (this.m_countBot == 0)
                            this.m_botTarget = null;
                        let state = this.m_isBot;
                        this.m_isBot = this.m_countBot > 0;
                        if (state != this.m_isBot)
                            this.node.emit(this.m_emitBot, this.m_isBot);
                        break;
                }
                break;
            case this.TagHead:
                if (otherCollider.sensor)
                    break;
                if (otherCollider.getComponent(BodyPlatformX) != null)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                        this.m_countHead = math.clamp(this.m_countHead - 1, 0, this.m_countHead);
                        this.m_isHead = this.m_countHead > 0;
                        break;
                }
                break;
            case this.TagBotHead:
                if (otherCollider.sensor)
                    break;
                switch (otherCollider.tag) {
                    case this.TagGround:
                    case this.TagPlatform:
                        this.m_countBotHead = math.clamp(this.m_countBotHead - 1, 0, this.m_countBotHead);
                        this.m_isBotHead = this.m_countBotHead == 0;
                        break;
                }
                break;
            case this.TagMelee:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_meleeTarget.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_meleeTarget.splice(index, 1);
                        this.node.emit(this.m_emitMelee, otherCollider.node, false);
                        break;
                }
                break;
            case this.TagRange:
                switch (otherCollider.tag) {
                    case this.TagTarget:
                        let index = this.m_rangeTarget.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_rangeTarget.splice(index, 1);
                        this.node.emit(this.m_emitRange, otherCollider.node, false);
                        break;
                }
                break;
            case this.TagInteraction:
                switch (otherCollider.tag) {
                    case this.TagBox:
                        let index = this.m_interacteTarget.findIndex(t => t == otherCollider.node);
                        if (index < 0)
                            break;
                        this.m_interacteTarget.splice(index, 1);
                        this.node.emit(this.m_emitInteracte, otherCollider.node, false);
                        break;
                }
                break;
        }
    }

    onDirUpdate(dir: number) {
        if (dir > 0)
            dir = 1;
        else if (dir < 0)
            dir = -1;
        else return;

        this.m_dir = dir;

        if (this.m_colliderHead != null ? this.m_colliderHead.isValid : false) {
            let headColliderOffset = this.m_colliderHead.offset;
            headColliderOffset.x = this.m_offsetHeadX * dir;
            this.m_colliderHead.offset = headColliderOffset;
            this.m_colliderHead.apply(); //Called this onStart() make bug (?)
        }

        if (this.m_colliderBotHead != null ? this.m_colliderBotHead.isValid : false) {
            let botHeadColliderOffset = this.m_colliderBotHead.offset;
            botHeadColliderOffset.x = this.m_offsetBotHeadX * dir;
            this.m_colliderBotHead.offset = botHeadColliderOffset;
            this.m_colliderBotHead.apply(); //Called this onStart() make bug (?)
        }

        if (this.DirMelee && this.m_colliderMelee != null ? this.m_colliderMelee.isValid : false) {
            let meleeColliderOffset = this.m_colliderMelee.offset;
            meleeColliderOffset.x = this.m_offsetMeleeX * dir;
            this.m_colliderMelee.offset = meleeColliderOffset;
            this.m_colliderMelee.apply(); //Called this onStart() make bug (?)
        }

        if (this.DirRange && this.m_colliderRange != null ? this.m_colliderRange.isValid : false) {
            let rangeColliderOffset = this.m_colliderRange.offset;
            rangeColliderOffset.x = this.m_offsetRangeX * dir;
            this.m_colliderRange.offset = rangeColliderOffset;
            this.m_colliderRange.apply(); //Called this onStart() make bug (?)
        }

        this.m_isHead = false;
    }

    //

    onBotCheckOut() {
        this.m_isBot = false;
    }

    onRangeTargetNearest(): Node {
        let target: Node = null;
        let distance = 0;
        for (let i = 0; i < this.m_rangeTarget.length; i++) {
            let targetCheck = this.m_rangeTarget[i];
            if (this.m_dir == 1 && this.node.worldPosition.clone().x > targetCheck.worldPosition.clone().x)
                continue;
            if (this.m_dir == -1 && this.node.worldPosition.clone().x < targetCheck.worldPosition.clone().x)
                continue;
            if (target == null ? true : !target.isValid) {
                target = targetCheck;
                let posA = this.node.worldPosition.clone();
                let posB = targetCheck.worldPosition.clone();
                distance = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
            }
            else {
                let posA = this.node.worldPosition.clone();
                let posB = targetCheck.worldPosition.clone();
                let distanceCheck = Vec2.distance(v2(posA.x, posA.y), v2(posB.x, posB.y));
                if (distanceCheck < distance) {
                    target = targetCheck;
                    distance = distanceCheck;
                }
            }
        }
        return target;
    }
}