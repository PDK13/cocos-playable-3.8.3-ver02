import { _decorator, CCBoolean, CCFloat, CCString, Component, director, instantiate, Node, tween, TweenEasing, UIOpacity, v2, Vec2, Vec3 } from 'cc';
import { BaseConstant, EaseType } from '../BaseConstant';
const { ccclass, property } = _decorator;

class ScrollChildData {
    Node: Node;
    Opacity: UIOpacity;
}

@ccclass('UIScroll')
export class UIScroll extends Component {

    //@property({ group: { name: 'Init' }, type: Node })
    @property(Node)
    Content: Node = null;

    @property({ group: { name: 'Main' }, type: CCFloat })
    Duration: number = 0.5;
    @property({ group: { name: 'Main' }, type: EaseType })
    Ease: EaseType = EaseType.linear;

    @property({ group: { name: 'Init' }, type: Vec2 })
    Offset: Vec2 = v2(0, 0);
    @property({ group: { name: 'Init' }, type: Vec2 })
    OffsetEach: Vec2 = v2(250, 0); //Offset of each item (left & right index) by their index from centre item (with 0 index)
    @property({ group: { name: 'Init' }, type: [Vec2] })
    OffsetFixed: Vec2[] = [v2(0, 0)];
    @property({ group: { name: 'Init' }, type: [CCFloat] })
    ScaleFixed: number[] = [1, 0.75, 0.5, 0.25];
    @property({ group: { name: 'Init' }, type: [CCFloat] })
    OpacityFixed: number[] = [255, 205, 155, 55];

    m_child: ScrollChildData[] = [];

    m_pos: Vec3[] = [];
    m_posL: Vec3;
    m_posR: Vec3;

    m_scale: Vec3[] = [];
    m_scaleL: Vec3;
    m_scaleR: Vec3;

    m_opacity: number[] = [];
    m_opacityL: number;
    m_opacityR: number;

    m_sib: number[] = [];
    m_centre: number = 0;
    m_delay: boolean = false;

    //If item(s) got using Spine (Skeleton), it might make some clitch on side item when scrolling

    protected onLoad(): void {
        //director.on(BaseConstant.INPUT_MOVE_LEFT, this.onScrollLeft, this);
        //director.on(BaseConstant.INPUT_MOVE_RIGHT, this.onScrollRight, this);
    }

    protected start(): void {
        //---------Group
        this.m_child = [];
        for (let i = 0; i < this.Content.children.length; i++) {
            let child = new ScrollChildData();
            child.Node = this.Content.children[i];
            child.Opacity = this.Content.children[i].getComponent(UIOpacity);
            this.m_child.push(child);
        }
        //this.m_child = this.m_child.sort((a, b) => a.position.y - b.position.y); //Sort low to high, if a-b < 0 then a < b (When want to reverse, use b-a)
        //---------Group

        //---------Centre
        this.m_centre = this.m_child.length % 2 == 0 ? this.m_child.length / 2 : (this.m_child.length - 1) / 2;

        //---------Child
        let fromCentre = 0;
        let indexCheckL = this.m_centre - fromCentre;
        let indexCheckR = this.m_centre + fromCentre;
        while (indexCheckL >= 0) {
            //---------ChildL
            if (indexCheckL >= 0) {
                //Pos
                let pos = Vec3.RIGHT.clone().multiplyScalar(-this.OffsetEach.x * fromCentre);
                pos.y = this.OffsetEach.y * indexCheckL;
                if (fromCentre < this.OffsetFixed.length - 1) {
                    pos.x -= this.OffsetFixed[indexCheckL].clone().x;
                    pos.y += this.OffsetFixed[indexCheckL].clone().y;
                }
                else {
                    pos.x -= this.OffsetFixed[this.OffsetFixed.length - 1].clone().x;
                    pos.y += this.OffsetFixed[this.OffsetFixed.length - 1].clone().y;
                }
                pos.x += this.Offset.x;
                pos.y += this.Offset.y;
                this.m_child[indexCheckL].Node.position = pos;
                //Scale
                if (fromCentre < this.ScaleFixed.length)
                    this.m_child[indexCheckL].Node.scale = Vec3.ONE.clone().multiplyScalar(this.ScaleFixed[fromCentre]);
                else
                    this.m_child[indexCheckL].Node.scale = Vec3.ONE.clone().multiplyScalar(this.ScaleFixed[this.ScaleFixed.length - 1]);
                //Opacity
                if (this.m_child[indexCheckL].Opacity != null) {
                    if (fromCentre < this.OpacityFixed.length)
                        this.m_child[indexCheckL].Opacity.opacity = this.OpacityFixed[fromCentre];
                    else
                        this.m_child[indexCheckL].Opacity.opacity = this.OpacityFixed[this.OpacityFixed.length - 1];
                }
            }
            //---------ChildR
            if (fromCentre != 0) {
                if (indexCheckR <= this.m_child.length - 1) {
                    //Pos
                    let pos = Vec3.RIGHT.clone().multiplyScalar(this.OffsetEach.x * fromCentre);
                    pos.y = this.OffsetEach.y * indexCheckL;
                    if (fromCentre < this.OffsetFixed.length - 1) {
                        pos.x += this.OffsetFixed[indexCheckL].clone().x;
                        pos.y += this.OffsetFixed[indexCheckL].clone().y;
                    }
                    else {
                        pos.x += this.OffsetFixed[this.OffsetFixed.length - 1].clone().x;
                        pos.y += this.OffsetFixed[this.OffsetFixed.length - 1].clone().y;
                    }
                    pos.x += this.Offset.x;
                    pos.y += this.Offset.y;
                    this.m_child[indexCheckR].Node.position = pos;
                    //Scale
                    if (fromCentre < this.ScaleFixed.length)
                        this.m_child[indexCheckR].Node.scale = Vec3.ONE.clone().multiplyScalar(this.ScaleFixed[fromCentre]);
                    else
                        this.m_child[indexCheckR].Node.scale = Vec3.ONE.clone().multiplyScalar(this.ScaleFixed[this.ScaleFixed.length - 1]);
                    //Opacity
                    if (this.m_child[indexCheckR].Opacity != null) {
                        if (fromCentre < this.OpacityFixed.length)
                            this.m_child[indexCheckR].Opacity.opacity = this.OpacityFixed[fromCentre];
                        else
                            this.m_child[indexCheckR].Opacity.opacity = this.OpacityFixed[this.OpacityFixed.length - 1];
                    }
                }
            }
            fromCentre++;
            indexCheckL = this.m_centre - fromCentre;
            indexCheckR = this.m_centre + fromCentre;
        }
        //---------Child

        //---------Pos
        for (let i = 0; i < this.m_child.length; i++)
            this.m_pos.push(this.m_child[i].Node.position.clone());
        //---------Pos

        //---------Pos-Side
        this.m_posL = this.m_pos[0].clone().add(Vec3.RIGHT.clone().multiplyScalar(-this.OffsetEach.x * 1));
        this.m_posL.y = this.OffsetEach.y * indexCheckL;
        this.m_posL.x += this.Offset.x;
        this.m_posL.y += this.Offset.y;
        this.m_posR = this.m_pos[this.m_pos.length - 1].clone().add(Vec3.RIGHT.clone().multiplyScalar(this.OffsetEach.x * 1));
        this.m_posR.y = this.OffsetEach.y * indexCheckL;
        this.m_posR.x += this.Offset.x;
        this.m_posR.y += this.Offset.y;
        //---------Pos-Side

        //---------Scale
        this.m_scaleL = Vec3.ZERO.clone();
        this.m_scaleR = Vec3.ZERO.clone();
        for (let i = 0; i < this.m_child.length; i++)
            this.m_scale.push(this.m_child[i].Node.scale.clone());
        //---------Scale

        //---------Opacity
        this.m_opacityL = 0;
        this.m_opacityR = 0;
        for (let i = 0; i < this.m_child.length; i++)
            this.m_opacity.push(this.m_child[i].Opacity != null ? this.m_child[i].Opacity.opacity : 255);
        //---------Opacity

        //---------SiblingIndex
        let sibIndex = 1;
        for (let i = 0; i < this.m_child.length; i++) {
            if (i == this.m_centre)
                sibIndex -= 1;
            this.m_sib.push(sibIndex);
            sibIndex += (i < this.m_centre ? 2 : -2);
        }
        for (let i = 0; i < this.m_child.length; i++) {
            for (let j = 0; j < this.m_child.length; j++) {
                if (this.m_sib[j] != i)
                    continue;
                this.m_child[j].Node.setSiblingIndex(this.m_sib[j]);
                break;
            }
        }
        //---------SiblingIndex
    }

    //

    onScrollLeft() {
        if (this.m_delay)
            return;
        this.m_delay = true;
        this.scheduleOnce(() => this.m_delay = false, this.Duration + 0.02);

        //---------Side Clone
        let childSideClone = instantiate(this.m_child[0].Node);
        childSideClone.setParent(this.m_child[0].Node.parent, true);
        childSideClone.position = this.m_pos[0];
        //Move
        tween(childSideClone)
            .to(this.Duration, { position: this.m_posL }, { easing: EaseType[this.Ease] as TweenEasing })
            .start();
        //Scale
        tween(childSideClone)
            .to(this.Duration, { scale: Vec3.ZERO.clone() }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => childSideClone.destroy())
            .start();
        //Opacity
        let childSideCloneOpacity = childSideClone.getComponent(UIOpacity);
        if (childSideCloneOpacity != null)
            tween(childSideCloneOpacity)
                .to(this.Duration, { opacity: 0 }, { easing: EaseType[this.Ease] as TweenEasing })
                .start();
        //---------Side Clone

        //---------Side
        let childSide = this.m_child[0];
        childSide.Node.position = this.m_posR;
        childSide.Node.scale = Vec3.ZERO.clone();
        if (childSide.Opacity != null)
            childSide.Opacity.opacity = 0;

        //---------Index
        let tempChild = this.m_child[0];
        for (let i = 0; i < this.m_child.length - 1; i++)
            this.m_child[i] = this.m_child[i + 1];
        this.m_child[this.m_child.length - 1] = tempChild;

        //---------Child
        let fromCentre = 0;
        let indexCheckL = this.m_centre - fromCentre;
        let indexCheckR = this.m_centre + fromCentre;
        while (indexCheckL >= 0) {
            //---------ChildL
            if (indexCheckL >= 0) {
                //Pos
                tween(this.m_child[indexCheckL].Node)
                    .to(this.Duration, { position: this.m_pos[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Scale
                tween(this.m_child[indexCheckL].Node)
                    .to(this.Duration, { scale: this.m_scale[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Opacity
                if (this.m_child[indexCheckL].Opacity != null)
                    tween(this.m_child[indexCheckL].Opacity)
                        .to(this.Duration, { opacity: this.m_opacity[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
            }
            else {
                //Pos
                tween(childSide.Node)
                    .to(this.Duration, { position: this.m_pos[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Scale
                tween(childSide.Node)
                    .to(this.Duration, { scale: this.m_scale[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Opacity
                if (childSide.Opacity != null)
                    tween(childSide.Opacity)
                        .to(this.Duration, { opacity: this.m_opacity[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
            }
            //---------ChildR
            if (fromCentre != 0) {
                if (indexCheckR <= this.m_child.length - 1) {
                    //Pos
                    tween(this.m_child[indexCheckR].Node)
                        .to(this.Duration, { position: this.m_pos[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Scale
                    tween(this.m_child[indexCheckR].Node)
                        .to(this.Duration, { scale: this.m_scale[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Opacity
                    if (this.m_child[indexCheckR].Opacity != null)
                        tween(this.m_child[indexCheckR].Opacity)
                            .to(this.Duration, { opacity: this.m_opacity[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                            .start();
                }
            }
            fromCentre++;
            indexCheckL = this.m_centre - fromCentre;
            indexCheckR = this.m_centre + fromCentre;
        }
        //---------Child

        //---------SiblingIndex
        for (let i = 0; i < this.m_child.length; i++) {
            for (let j = 0; j < this.m_child.length; j++) {
                if (this.m_sib[j] != i)
                    continue;
                this.m_child[j].Node.setSiblingIndex(this.m_sib[j]);
                break;
            }
        }
        childSideClone.setSiblingIndex(0);
        //---------SiblingIndex
    }

    onScrollRight() {
        if (this.m_delay)
            return;
        this.m_delay = true;
        this.scheduleOnce(() => this.m_delay = false, this.Duration + 0.02);

        //---------Side Clone
        let childSideClone = instantiate(this.m_child[this.m_child.length - 1].Node);
        childSideClone.setParent(this.m_child[this.m_child.length - 1].Node.parent, true);
        childSideClone.position = this.m_pos[this.m_pos.length - 1];
        //Move
        tween(childSideClone)
            .to(this.Duration, { position: this.m_posR }, { easing: EaseType[this.Ease] as TweenEasing })
            .start();
        //Scale
        tween(childSideClone)
            .to(this.Duration, { scale: Vec3.ZERO.clone() }, { easing: EaseType[this.Ease] as TweenEasing })
            .call(() => childSideClone.destroy())
            .start();
        //Opacity
        let childSideCloneOpacity = childSideClone.getComponent(UIOpacity);
        if (childSideCloneOpacity != null)
            tween(childSideCloneOpacity)
                .to(this.Duration, { opacity: 0 }, { easing: EaseType[this.Ease] as TweenEasing })
                .start();
        //---------Side Clone

        //---------Side
        let childSide = this.m_child[this.m_child.length - 1];
        childSide.Node.position = this.m_posL;
        childSide.Node.scale = Vec3.ZERO.clone();
        if (childSide.Opacity != null)
            childSide.Opacity.opacity = 0;

        //---------Index
        let tempChild = this.m_child[this.m_child.length - 1];
        for (let i = this.m_child.length - 1; i > 0; i--)
            this.m_child[i] = this.m_child[i - 1];
        this.m_child[0] = tempChild;

        //---------Child
        let fromCentre = 0;
        let indexCheckL = this.m_centre - fromCentre;
        let indexCheckR = this.m_centre + fromCentre;
        while (indexCheckL >= 0) {
            //---------ChildL
            if (indexCheckL >= 0) {
                //Pos
                tween(this.m_child[indexCheckL].Node)
                    .to(this.Duration, { position: this.m_pos[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Scale
                tween(this.m_child[indexCheckL].Node)
                    .to(this.Duration, { scale: this.m_scale[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                    .start();
                //Opacity
                if (this.m_child[indexCheckL].Opacity != null)
                    tween(this.m_child[indexCheckL].Opacity)
                        .to(this.Duration, { opacity: this.m_opacity[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
            }
            //---------ChildR
            if (fromCentre != 0) {
                if (indexCheckR <= this.m_child.length - 1) {
                    //Pos
                    tween(this.m_child[indexCheckR].Node)
                        .to(this.Duration, { position: this.m_pos[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Scale
                    tween(this.m_child[indexCheckR].Node)
                        .to(this.Duration, { scale: this.m_scale[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Scale
                    if (this.m_child[indexCheckR].Opacity != null)
                        tween(this.m_child[indexCheckR].Opacity)
                            .to(this.Duration, { opacity: this.m_opacity[indexCheckR] }, { easing: EaseType[this.Ease] as TweenEasing })
                            .start();
                }
                else {
                    //Pos
                    tween(childSide.Node)
                        .to(this.Duration, { position: this.m_pos[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Scale
                    tween(childSide.Node)
                        .to(this.Duration, { scale: this.m_scale[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                        .start();
                    //Opacity
                    if (childSide.Opacity != null)
                        tween(childSide.Opacity)
                            .to(this.Duration, { opacity: this.m_opacity[indexCheckL] }, { easing: EaseType[this.Ease] as TweenEasing })
                            .start();
                }
            }
            fromCentre++;
            indexCheckL = this.m_centre - fromCentre;
            indexCheckR = this.m_centre + fromCentre;
        }
        //---------Child

        //---------SiblingIndex
        for (let i = 0; i < this.m_child.length; i++) {
            for (let j = 0; j < this.m_child.length; j++) {
                if (this.m_sib[j] != i)
                    continue;
                this.m_child[j].Node.setSiblingIndex(this.m_sib[j]);
                break;
            }
        }
        childSideClone.setSiblingIndex(0);
        //---------SiblingIndex
    }

    getCentre(): Node {
        return this.m_child[this.m_centre].Node;
    }
}