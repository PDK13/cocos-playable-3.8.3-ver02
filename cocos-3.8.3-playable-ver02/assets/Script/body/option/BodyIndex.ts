import { _decorator, CCBoolean, CCInteger, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum IndexSortType {
    FromTopY_ToBotIndex,
    FromBotY_ToTopIndex,
};
Enum(IndexSortType);

@ccclass('BodyIndex')
export class BodyIndex extends Component {

    @property({ group: { name: 'Tag' }, type: CCInteger })
    TagBody: number = 50;

    @property({ group: { name: 'Option' }, type: IndexSortType })
    Sort: IndexSortType = IndexSortType.FromBotY_ToTopIndex;
    @property({ group: { name: 'Option' }, type: CCBoolean })
    SortSimple: boolean = false;

    protected onLoad(): void {
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(colliderCheck => {
            if (colliderCheck.tag == this.TagBody)
                colliderCheck.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        });
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (selfCollider.node.parent != otherCollider.node.parent || selfCollider.node == otherCollider.node)
            return;
        if (otherCollider.tag == this.TagBody) {
            if (this.SortSimple) {
                switch (this.Sort) {
                    case IndexSortType.FromBotY_ToTopIndex:
                        if (selfCollider.node.position.clone().y > otherCollider.node.position.clone().y) {
                            selfCollider.node.setSiblingIndex(otherCollider.node.getSiblingIndex());
                            otherCollider.node.setSiblingIndex(otherCollider.node.getSiblingIndex() - 1);
                        }
                        break;
                    case IndexSortType.FromTopY_ToBotIndex:
                        if (selfCollider.node.position.clone().y < otherCollider.node.position.clone().y) {
                            selfCollider.node.setSiblingIndex(otherCollider.node.getSiblingIndex());
                            otherCollider.node.setSiblingIndex(otherCollider.node.getSiblingIndex() + 1);
                        }
                        break;
                }
            }
            else
                this.onIndexRangeByY();
        }
    }

    onIndexRangeByY() {
        let childOther: Node[] = this.node.parent.children.filter(t => t);
        for (var i = 0; i < childOther.length - 1; i++) {
            for (var j = i + 1; j < childOther.length; j++) {
                switch (this.Sort) {
                    case IndexSortType.FromBotY_ToTopIndex:
                        if (childOther[i].position.y < childOther[j].position.y) {
                            var temp = childOther[i];
                            childOther[i] = childOther[j];
                            childOther[j] = temp;
                        }
                        break;
                    case IndexSortType.FromTopY_ToBotIndex:
                        if (childOther[i].position.y > childOther[j].position.y) {
                            var temp = childOther[i];
                            childOther[i] = childOther[j];
                            childOther[j] = temp;
                        }
                        break;
                }

            }
        }
        for (var i = 0; i < childOther.length; i++)
            childOther[i].setSiblingIndex(i);
    }
}