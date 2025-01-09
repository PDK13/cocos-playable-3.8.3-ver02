import { _decorator, CCBoolean, CCFloat, CCInteger, Component, ERaycast2DType, Node, PhysicsSystem2D, UITransform, v2, v3, Vec2 } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('BaseLaze')
export class LazeBase extends Component {

    @property({ group: { name: 'Raycast' }, type: CCInteger })
    RaycastStep: number = 200;
    @property({ group: { name: 'Raycast' }, type: CCFloat })
    RaycastUnit: number = 1;
    @property({ group: { name: 'Raycast' }, type: CCFloat })
    RaycastDeg: number = 0;

    @property({ group: { name: 'Laze' }, type: CCBoolean })
    WidthFixed: boolean = false;
    @property({ group: { name: 'Laze' }, type: CCBoolean })
    XFixed: boolean = false;
    @property({ group: { name: 'Laze' }, type: UITransform })
    Laze: UITransform = null;
    @property({ group: { name: 'Laze' }, type: Node })
    Effect: Node = null;

    @property({ group: { name: 'Tag' }, type: [CCInteger] })
    TagContact: number[] = [100];

    m_stepLast: number = 0;

    protected onLoad(): void {

    }

    protected start(): void {
        this.onLazeUpdate(this.RaycastStep, this.RaycastUnit);
    }

    protected update(dt: number): void {
        //NOTE: If Raycast too long, it might got bug...
        let p0 = v2(this.node.worldPosition.clone().x, this.node.worldPosition.clone().y);
        let step = 1;
        for (step = 1; step < this.RaycastStep; step++) {
            //Next Step check:
            let p1 = p0.clone().add(this.getDir(this.RaycastDeg, (step - 1) * this.RaycastUnit));
            let p2 = p0.clone().add(this.getDir(this.RaycastDeg, step * this.RaycastUnit));
            const raycastResult = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Any);
            if (raycastResult.length < 1)
                //Not found any target!
                continue;
            let raycastTag = this.TagContact.length == 0;
            for (let i = 0; i < raycastResult.length; i++) {
                let targetIndex = this.TagContact.findIndex((t) => t == raycastResult[i].collider.tag);
                if (targetIndex > -1) {
                    raycastTag = true;
                    raycastResult[i].collider.node.emit(ConstantBase.ON_NODE_HIT, 1);
                    break;
                }
            }
            if (!raycastTag)
                //Not found any target match with Tag check!
                continue;
            break;
        }
        this.onLazeUpdate(step, this.RaycastUnit);
    }

    //

    private onLazeUpdate(step: number, unit: number) {
        if (this.WidthFixed) {
            let size = this.Laze.contentSize.clone();
            size.x = step * unit;
            this.Laze.contentSize = size;
        }
        else {
            let size = this.Laze.contentSize.clone();
            size.y = step * unit;
            this.Laze.contentSize = size;
        }
        if (this.XFixed)
            this.Effect.position = v3(step * unit, 0, 0);
        else
            this.Effect.position = v3(0, step * unit, 0);
    }

    private getDir(deg: number, length: number): Vec2 {
        let dir = v2(Math.cos(deg * (Math.PI / 180)), Math.sin(deg * (Math.PI / 180)));
        dir.x *= length;
        dir.y *= length;
        return dir;
    }
}