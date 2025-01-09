import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, game, Input, Label, Node, PhysicsSystem2D, sys, System } from 'cc';
import { BaseConstant } from '../BaseConstant';
const { ccclass, property } = _decorator;

@ccclass('ManagerEvent')
export class ManagerEvent extends Component {

    @property({ group: { name: 'Store' }, type: CCBoolean })
    DirectStore: boolean = false;
    @property({ group: { name: 'Store' }, type: CCString })
    OnDirectStore: string = BaseConstant.DIRECT_STORE;
    @property({ group: { name: 'Store' }, type: CCFloat })
    DelayDirectStore: number = 0;
    @property({ group: { name: 'Store' }, type: CCString })
    Android: string = '';
    @property({ group: { name: 'Store' }, type: CCString })
    IOS: string = '';
    @property({ group: { name: 'Store' }, type: CCInteger })
    AdsType: number = 0;
    @property({ group: { name: 'Store' }, type: CCBoolean })
    DebugStore: boolean = false;

    @property({ group: { name: 'Press' }, type: CCBoolean })
    DirectPress: boolean = false;
    @property({ group: { name: 'Press' }, type: CCBoolean })
    DirectPressStopEvent: boolean = false;
    @property({ group: { name: 'Press' }, type: CCString })
    EmitDirectPress: string = BaseConstant.DIRECT_PRESS;

    @property({ group: { name: 'Limit' }, type: CCBoolean })
    LimitActive: boolean = true;
    @property({ group: { name: 'Limit' }, type: CCFloat })
    LimitDuration: number = 30;
    @property({ group: { name: 'Limit' }, type: CCString })
    EmitLimit: string = BaseConstant.GAME_TIME_OUT;
    @property({ group: { name: 'Limit' }, type: CCString })
    LimitTimeFormat: string = '(time)s';
    @property({ group: { name: 'Limit' }, type: Label })
    LimitTimeLabel: Label = null;

    static Finish: boolean = false;

    m_directPress: Node = null;
    m_storeOpen: boolean = false;
    m_limitCountdown: number;

    protected onLoad(): void {
        game.frameRate = 59;
        PhysicsSystem2D.instance.enable = true;

        director.on(BaseConstant.PLAYER_COMPLETE, this.onStop, this);
        director.on(BaseConstant.PLAYER_DEAD, this.onStop, this);
        director.on(BaseConstant.GAME_COMPLETE, this.onStop, this);
        director.on(BaseConstant.GAME_LOSE, this.onStop, this);
        director.on(BaseConstant.GAME_TIME_OUT, this.onStop, this);

        director.on(this.OnDirectStore, this.onStore, this);

        this.m_directPress = this.node.getChildByName('press');

        if (ManagerEvent.Finish)
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
        else {
            if (this.DirectStore) {
                if (this.DirectPress) {
                    director.on(BaseConstant.GAME_COMPLETE, this.onPressStoreInit, this);
                    director.on(BaseConstant.GAME_LOSE, this.onPressStoreInit, this);
                    director.on(BaseConstant.GAME_TIME_OUT, this.onPressStoreInit, this);
                }
                else
                    this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
            }
            if (this.DirectPress) {
                this.m_directPress.on(Input.EventType.TOUCH_START, this.onPress, this);
                director.on(BaseConstant.INPUT_LOCK, this.onLock, this);
                director.on(BaseConstant.INPUT_RESUME, this.onResume, this);
            }
        }
    }

    protected start(): void {
        if (this.LimitActive) {
            if (this.LimitTimeLabel != null) {
                this.m_limitCountdown = this.LimitDuration;
                this.onLimitCountdown();
            }
            else
                this.scheduleOnce(() => director.emit(this.EmitLimit), this.LimitDuration);
        }

        //mintegral
        window.gameReady && window.gameReady();
    }

    onStore() {
        this.scheduleOnce(() => {
            let link = '';
            switch (sys.os) {
                case sys.OS.ANDROID:
                    link = this.Android;
                    openGameStoreUrl(link);
                    break;
                case sys.OS.IOS:
                    link = this.IOS;
                    openGameStoreUrl(link);
                    break;
                default:
                    link = this.Android;
                    if (this.DebugStore)
                        open(link, "mozillaWindow", "popup");
                    else
                        console.log('open store ' + link);
                    break;
            }

            //mintegral
            window.gameEnd && window.gameEnd();
            window.install && window.install();
        }, this.DelayDirectStore);
    }

    onRestart() {
        ManagerEvent.Finish = true;
        director.loadScene(director.getScene().name);
    }

    onPress() {
        director.emit(this.EmitDirectPress);
    }

    onLock() {
        this.m_directPress.off(Input.EventType.TOUCH_START, this.onPress, this);
    }

    onResume() {
        this.m_directPress.on(Input.EventType.TOUCH_START, this.onPress, this);
    }

    onStop() {
        this.unscheduleAllCallbacks();
        this.onPressStoreInit();
    }

    onPressStoreInit() {
        this.m_directPress.off(Input.EventType.TOUCH_START, this.onPress, this);
        director.off(BaseConstant.INPUT_LOCK, this.onLock, this);
        director.off(BaseConstant.INPUT_RESUME, this.onResume, this);

        if (this.DirectStore || ManagerEvent.Finish)
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
    }

    onLimitCountdown() {
        //Label show time
        this.LimitTimeLabel.string = this.LimitTimeFormat.replace('(time)', this.m_limitCountdown.toString());
        //Check time to stop or continue
        if (this.m_limitCountdown == 0) {
            director.emit(this.EmitLimit);
            return;
        }
        this.m_limitCountdown--;
        //Delay caculated time every second(s)
        this.scheduleOnce(() => this.onLimitCountdown(), 1);
    }
}