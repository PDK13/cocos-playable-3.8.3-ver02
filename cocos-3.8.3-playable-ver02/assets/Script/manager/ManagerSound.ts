import { _decorator, AudioSource, Component, director } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ManagerSound')
export class ManagerSound extends Component {

    @property(AudioSource)
    AudioMusic: AudioSource = null;

    onLoad() {
        if (this.AudioMusic == null)
            this.AudioMusic = this.getComponent(AudioSource);
        director.on(ConstantBase.PLAYER_COMPLETE, this.onStopMusic, this);
        director.on(ConstantBase.PLAYER_DEAD, this.onStopMusic, this);

        //director.on(BaseEventConstant.GAME_COMPLETE, this.onStopMusic, this);
        //director.on(BaseEventConstant.GAME_LOSE, this.onStopMusic, this);
        //director.on(BaseEventConstant.GAME_TIME_OUT, this.onStopMusic, this);
        //
        window.director = director;
        director.on("onVolumeChanged", this.onVolumeChanged, this);
        this.onVolumeChanged(window.isMute);
    }

    onDestroy() {
        director.off("onVolumeChanged", this.onVolumeChanged, this);
    }

    onVolumeChanged(mute: boolean) {
        let audioSources = this.getComponentsInChildren(AudioSource);
        audioSources.forEach(e => {
            e.volume = mute ? 0 : 1;
        });
    }

    onStopMusic() {
        this.AudioMusic.stop();
    }
}