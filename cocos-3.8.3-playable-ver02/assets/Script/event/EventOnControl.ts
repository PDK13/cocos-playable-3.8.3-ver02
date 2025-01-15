import { _decorator, Component, Node } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('EventOnControl')
export class EventOnControl extends Component {



    protected onLoad(): void {
        this.node.on(ConstantBase.NODE_EVENT, this.onEventDestroy, this);
    }
}