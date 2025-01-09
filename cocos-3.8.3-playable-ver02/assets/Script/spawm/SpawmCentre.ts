import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, instantiate, Node, randomRangeInt, v2, v3, Vec2 } from 'cc';
import { BodySpawm } from '../body/option/BodySpawm';
const { ccclass, property } = _decorator;

@ccclass('SpawmCentre')
export class SpawmCentre extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    Start: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    Once: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnStart: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    DelayStart: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnEnd: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEnd: string = '';

    @property({ group: { name: 'Spawm' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Spawm' }, type: CCInteger })
    Count: number = 10;
    @property({ group: { name: 'Spawm' }, type: CCInteger })
    Each: number = 100; //Spawm max count on each spawm progess turn
    @property({ group: { name: 'Spawm' }, type: CCFloat })
    Delay: number = 1;
    @property({ group: { name: 'Spawm' }, type: Node })
    List: Node = null;
    @property({ group: { name: 'Spawm' }, type: Vec2 })
    OffsetMax: Vec2 = v2(1000, 1000);
    @property({ group: { name: 'Spawm' }, type: Vec2 })
    OffsetMin: Vec2 = v2(500, 500);
    @property({ group: { name: 'Spawm' }, type: Node })
    Centre: Node = null;
    @property({ group: { name: 'Spawm' }, type: Node })
    Spawm: Node = null;

    m_progess: boolean = false;
    m_delay: boolean = false;
    m_spawm: Node[] = [];
    m_each: number = 0;

    protected onLoad(): void {
        if (this.OnStart != '')
            director.on(this.OnStart, this.onStart, this);
        if (this.OnEnd != '')
            director.on(this.OnEnd, this.onEnd, this);
    }

    protected start(): void {
        if (this.List == null)
            this.List = this.node;
        for (let i = 0; i < this.List.children.length; i++)
            this.List.children[i].active = false;
        if (this.Start) {
            this.onStart();
            if (this.DelayStart) {
                this.m_delay = true;
                this.scheduleOnce(() => this.m_delay = false, this.Delay);
            }
        }
    }

    protected lateUpdate(dt: number): void {
        this.onSpawm();
    }

    onStart() {
        if (this.Spawm == null)
            console.warn('Not found Centre to for progess');
        else if (this.Spawm == this.List)
            console.warn('Centre is the same as Group for progess');
        else
            this.m_progess = true;
        if (this.OnStart != '')
            director.off(this.OnStart, this.onStart, this);
    }

    onEnd() {
        this.m_progess = false;
        if (this.EmitEnd != '')
            director.emit(this.EmitEnd);
    }

    private onSpawm() {
        if (!this.m_progess)
            return;
        for (let i = this.m_spawm.length - 1; i >= 0; i--) {
            if (this.m_spawm[i].isValid)
                continue;
            this.m_spawm.splice(i, 1);
        }
        if (!this.m_delay) {
            if (this.m_spawm.length < this.Count) {
                this.m_delay = true;
                if (!this.Limit)
                    this.scheduleOnce(() => this.m_delay = false, this.Delay);
            }
            this.onSpawmProgess();
        }
        if (this.Limit && this.m_spawm.length == 0)
            this.onEnd();
    }

    private onSpawmProgess() {
        this.m_each = 0;
        while (this.m_spawm.length < this.Count && this.m_each < this.Each) {
            let base = this.List.children[randomRangeInt(0, this.List.children.length - 1)];
            base.setSiblingIndex(this.List.children.length - 1);

            //Target's Node instantiate
            let target = instantiate(base);
            target.setParent(this.Spawm, true);

            //Target's Node position set up
            let offset = v3();
            offset.x += randomRangeInt(0, this.OffsetMax.x) * (randomRangeInt(0, 10) % 2 == 0 ? 1 : -1);
            if (offset.x > this.OffsetMin.x || offset.x < -this.OffsetMin.x)
                offset.y += randomRangeInt(0, this.OffsetMax.y) * (randomRangeInt(0, 10) % 2 == 0 ? 1 : -1);
            else
                offset.y += randomRangeInt(this.OffsetMin.y, this.OffsetMax.y) * (randomRangeInt(0, 10) % 2 == 0 ? 1 : -1);
            let pos = this.Centre ? this.Centre.worldPosition.clone() : base.worldPosition.clone();
            pos = pos.add(offset.clone());
            target.worldPosition = pos;

            //Target's Body Spawm component init
            let bodySpawm = target.getComponent(BodySpawm);
            if (bodySpawm != null)
                bodySpawm.onInit();

            //Target's Node active
            this.scheduleOnce(() => target.active = true, 0.02);

            this.m_spawm.push(target);

            this.m_each++;
        };
    }
}