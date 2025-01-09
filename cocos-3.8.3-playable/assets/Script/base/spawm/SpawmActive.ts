import { _decorator, CCBoolean, CCFloat, CCString, Component, director, Node } from 'cc';
import { BodySpawm } from '../body/option/BodySpawm';
const { ccclass, property } = _decorator;

@ccclass('SpawmActive')
export class SpawmActive extends Component {

    @property({ group: { name: 'Event' }, type: CCBoolean })
    StartEvent: boolean = false;
    @property({ group: { name: 'Event' }, type: CCBoolean })
    OnceTrigger: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnStart: string = '';
    @property({ group: { name: 'Event' }, type: CCBoolean })
    DelayStart: boolean = false;
    @property({ group: { name: 'Event' }, type: CCString })
    OnDestroy: string = '';
    @property({ group: { name: 'Event' }, type: CCString })
    EmitEnd: string = '';

    @property({ group: { name: 'Spawm' }, type: CCFloat })
    Delay: number = 1;
    @property({ group: { name: 'Spawm' }, type: Node })
    Group: Node = null;

    m_progess: boolean = false;
    m_delay: boolean = false;
    m_spawm: Node[] = [];

    protected onLoad(): void {
        if (this.OnStart != '')
            director.on(this.OnStart, this.onStart, this);
    }

    protected start(): void {
        if (this.Group == null)
            this.Group = this.node;
        for (let i = 0; i < this.Group.children.length; i++)
            this.Group.children[i].active = false;
        if (this.StartEvent)
            this.onStart();
    }

    onStart() {
        if (this.m_progess)
            return;
        this.m_progess = true;
        if (this.DelayStart)
            this.scheduleOnce(() => this.onSpawm(), this.Delay);
        else
            this.onSpawm();
        if (this.OnStart != '')
            director.off(this.OnStart, this.onStart, this);
    }

    onSpawm() {
        for (let i = 0; i < this.Group.children.length; i++) {
            let target = this.Group.children[i];

            //Target's Body Spawm component init
            let bodySpawm = target.getComponent(BodySpawm);
            if (bodySpawm != null)
                bodySpawm.onInit();

            //Target's Node active
            this.scheduleOnce(() => target.active = true, 0.02);

            this.m_spawm.push(target);
        }
        if (this.OnDestroy != '')
            director.on(this.OnDestroy, this.onCheckTarget, this);
    }

    onEnd() {
        if (!this.m_progess)
            return;
        this.m_progess = false;
        if (this.EmitEnd != '')
            director.emit(this.EmitEnd);
        if (this.OnDestroy != '')
            director.off(this.OnDestroy, this.onCheckTarget, this);
    }

    onCheckTarget(target: Node) {
        if (!this.m_progess)
            return;
        if (target != null) {
            let index = this.m_spawm.findIndex(t => t == target);
            if (index < 0)
                return;
            this.m_spawm.splice(index, 1);
        }
        else {
            for (let i = this.m_spawm.length - 1; i >= 0; i--) {
                if (this.m_spawm[i].isValid)
                    continue;
                this.m_spawm.splice(i, 1);
            }
        }
        if (this.m_spawm.length == 0)
            this.onEnd();
    }
}