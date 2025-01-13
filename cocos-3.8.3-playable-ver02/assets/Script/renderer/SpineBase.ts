import { _decorator, CCBoolean, CCString, Component, director, sp, VERSION } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpineBase')
export class SpineBase extends Component {

    static SPINE_PLAY: string = 'SPINE_PLAY';
    static SPINE_STOP: string = 'SPINE_STOP';

    @property({ group: { name: 'Main' }, type: CCBoolean })
    FaceRight: boolean = true;
    @property({ group: { name: 'Main' }, type: sp.Skeleton })
    Spine: sp.Skeleton = null;
    @property({ group: { name: 'Main' }, type: [CCString] })
    Skin: string[] = [];

    @property({ group: { name: 'Option' }, type: CCBoolean })
    SpineEvent: boolean = false;
    @property({ group: { name: 'Option' }, type: sp.SkeletonData })
    Skeleton: sp.SkeletonData = null;
    @property({ group: { name: 'Option' }, type: [CCString] })
    Anim: string[] = [];

    m_spineScaleXR: number;
    m_dir: number = 1;
    m_spineAnim: string = '';
    m_spineLoop: boolean = false;
    m_spineAnimDuration: number = 0;
    m_spineAnimDurationScale: number = 0;
    m_spineTimeScale: number = 1;

    protected onLoad(): void {
        if (this.Spine == null)
            this.Spine = this.getComponent(sp.Skeleton) ?? this.getComponentInChildren(sp.Skeleton);

        this.m_dir = this.FaceRight ? 1 : -1;
        this.m_spineScaleXR = this.Spine._skeleton.scaleX;
        this.m_spineTimeScale = this.Spine.timeScale;

        if (this.SpineEvent) {
            director.on(SpineBase.SPINE_PLAY, this.onPlay, this);
            director.on(SpineBase.SPINE_STOP, this.onStop, this);
        }
    }

    protected start(): void {
        this.onSekeleton(this.Skeleton);
        if (this.Skin.length > 0)
            this.onSkin(...this.Skin);
        for (let i = 0; i < this.Anim.length; i++)
            this.onAnimationIndex(i, this.Anim[i], true);
    }

    //

    onSekeleton(data: sp.SkeletonData): void {
        if (data == null)
            return;
        this.Skeleton = data;
        this.Spine.skeletonData = data;
    }

    onSkin(...skin: string[]) {
        let baseData = this.Spine._skeleton.data;
        if (VERSION >= '3.8.3') {
            //NOTE: For some fucking reason, new spine.Skin(); got error with any value attach to it!
            let spineCache = sp.spine.wasmUtil.createSpineSkeletonDataWithJson(this.Spine.skeletonData.skeletonJsonStr, this.Spine.skeletonData.atlasText); //Tạo mới dữ liệu spine từ spine gốc
            let baseSkin = spineCache.defaultSkin;
            for (let i = 0; i < skin.length; i++) {
                let skinName = skin[i];
                let skinCheck = baseData.findSkin(skinName);
                if (baseSkin == null)
                    baseSkin = new Object(skinCheck) as sp.spine.Skin;
                else
                    baseSkin.addSkin(skinCheck);
            }
            this.Spine._skeleton.setSkin(baseSkin);
            this.Spine._skeleton.setSlotsToSetupPose();
            this.Spine.getState().apply(this.Spine._skeleton);
        }
        else {
            this.Skin = skin;
            let baseSkin = new sp.spine.Skin('base-char');
            skin.forEach(skinCheck => {
                //NOTE: For some fucking reason, SkinCheck is a string value, not is a array string value!
                let SkinData = skinCheck.split(',');
                SkinData.forEach(SkinFound => {
                    baseSkin.addSkin(baseData.findSkin(SkinFound));
                });
            });
            this.Spine._skeleton.setSkin(baseSkin);
            this.Spine._skeleton.setSlotsToSetupPose();
            this.Spine.getState().apply(this.Spine._skeleton);
        }
    }

    //

    onPlay(): void {
        this.Spine.timeScale = this.m_spineTimeScale;
    }

    onStop(): void {
        this.Spine.timeScale = 0;
    }

    //

    onMix(animFrom: string, animTo: string, duration: number) {
        //Setting mix between 2 animation in fixed duration!
        this.Spine.setMix(animFrom, animTo, duration);
    }

    //

    onAnimation(anim: string, loop: boolean, durationScale: boolean = false): number {
        if (this.m_spineAnim == anim)
            return durationScale ? this.m_spineAnimDuration : this.m_spineAnimDurationScale;
        this.m_spineAnim = anim;
        this.m_spineLoop = loop;
        this.m_spineAnimDuration = this.Spine.setAnimation(0, anim, loop).animationEnd;
        this.m_spineAnimDurationScale = 1.0 * this.m_spineAnimDuration / this.Spine.timeScale;
        return durationScale ? this.m_spineAnimDuration : this.m_spineAnimDurationScale;
    }

    onAnimationForce(anim: string, loop: boolean, durationScale: boolean = false): number {
        this.m_spineAnim = anim;
        this.m_spineLoop = loop;
        this.m_spineAnimDuration = this.Spine.setAnimation(0, anim, loop).animationEnd;
        this.m_spineAnimDurationScale = 1.0 * this.m_spineAnimDuration / this.Spine.timeScale;
        return durationScale ? this.m_spineAnimDuration : this.m_spineAnimDurationScale;
    }

    onAnimationForceLast(durationScale: boolean = false): number {
        return this.onAnimationForce(this.m_spineAnim, this.m_spineLoop, durationScale);
    }

    getAnimation(): string {
        return this.m_spineAnim;
    }

    getAnimationDuration(): number {
        return this.m_spineAnimDuration;
    }

    getAnimationDurationScale(): number {
        return this.m_spineAnimDurationScale;
    }

    onTimeScale(TimeScale: number = 1) {
        this.m_spineTimeScale = TimeScale;
        this.Spine.timeScale = TimeScale;
    }

    //

    onAnimationIndex(index: number, anim: string, loop: boolean, durationScale: boolean = false): number {
        let Duration = this.Spine.setAnimation(index, anim, loop).animationEnd;
        let Scale = durationScale ? this.Spine.timeScale : 1;
        return Duration / Scale;
    }

    onAnimationEmty(index: number, mixDuration: number) {
        this.Spine.getState().setEmptyAnimation(index, mixDuration);
        this.Spine.getState().clearTrack
    }

    onAnimationClear(index: number) {
        this.Spine.getState().clearTrack(index);
    }

    //

    onFaceDir(dir: number) {
        this.m_dir = dir;
        this.Spine._skeleton.scaleX = this.m_spineScaleXR * dir;
        this.Spine._skeleton.updateWorldTransform();
    }
}