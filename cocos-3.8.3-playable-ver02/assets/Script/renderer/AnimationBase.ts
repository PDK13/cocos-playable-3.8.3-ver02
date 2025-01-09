import { _decorator, AnimationComponent, CCBoolean, Component, director, v3 } from 'cc';
const { ccclass, property } = _decorator;

//Document: https://docs.cocos.com/creator/3.8/manual/en/animation/animation-component.html

@ccclass('AnimationBase')
export class AnimationBase extends Component {

    static ANIMATION_PLAY: string = 'ANIMATION_PLAY';
    static ANIMATION_STOP: string = 'ANIMATION_STOP';

    @property(AnimationComponent)
    Animation: AnimationComponent = null;

    @property(CCBoolean)
    AnimationEvent: boolean = false;

    m_animationName: string = '';
    m_baseScaleX: number;
    m_dir: Number = 1;

    protected onLoad(): void {
        if (this.AnimationEvent) {
            director.on(AnimationBase.ANIMATION_PLAY, this.Animation.resume, this);
            director.on(AnimationBase.ANIMATION_STOP, this.Animation.pause, this);
        }
    }

    protected start(): void {
        this.m_baseScaleX = this.Animation.node.scale.x;
    }

    public SetPlay(anim: string = ''): void {
        if (this.m_animationName == anim)
            return;
        this.m_animationName = anim;

        if (anim != '')
            this.Animation.play(anim);
        else
            this.Animation.play();
    }

    public SetPlaySmooth(anim1: string, anim2: string, smooth: number): void {
        if (this.m_animationName == anim1 || this.m_animationName == anim2)
            return;

        this.Animation.play(anim1);
        this.Animation.crossFade(anim2, smooth);

        this.m_animationName = anim1;
        this.scheduleOnce(() => this.m_animationName = anim2, smooth);
    }

    public SetPause() {
        this.Animation.pause();
    }

    public SetResume() {
        this.Animation.resume();
    }

    public SetStop() {
        this.Animation.stop();
    }

    //

    public SetDir(dir: number) {
        this.Animation.node.setScale(v3(this.m_baseScaleX * dir, this.Animation.node.getScale().y, 0));
    }

    public SetLeft() {
        this.SetDir(-1);
    }

    public SetRight() {
        this.SetDir(1);
    }
}