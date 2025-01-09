import { _decorator, CCBoolean, Component, Label, Node, UI } from 'cc';
import { FontType } from '../ConstantBase';
const { ccclass, property, executeInEditMode, playOnFocus } = _decorator;

@ccclass('EditorLabel')
@executeInEditMode()
@playOnFocus()
export class EditorLabel extends Component {

    @property({ type: FontType })
    Font: FontType = FontType.Arial;

    m_labels: Label[] = [];
    m_font: string = '';

    protected onLoad(): void {
        this.m_labels = this.getComponents(Label);
    }

    protected start(): void {
        this.onLabelFontUpdate();
    }

    onFocusInEditor(): void {
        this.onLabelFontUpdate();
    }

    onLostFocusInEditor(): void {
        this.onLabelFontUpdate();
    }

    //

    onLabelFontUpdate() {
        this.m_font = this.getFontFamilyValue(this.Font);
        this.m_labels.forEach(t => t.fontFamily = this.m_font);
        console.log('[debug] \'' + this.node.name + '\' font changed to \'' + this.m_font + '\'');
    }

    getFontFamilyValue(Font: FontType) {
        switch (Font) {
            case FontType.Arial: return 'Arial';
            case FontType.TimesNewRoman: return 'Times New Roman';
            case FontType.Verdana: return 'Verdana';
            case FontType.Tahoma: return 'Tahoma';
            case FontType.ComicSansMS: return 'Comic Sans MS';
            case FontType.TrebuchetMS: return 'Trebuchet MS';
            case FontType.Impact: return 'Impact';
            case FontType.Georgia: return 'Georgia';
            case FontType.CourierNew: return 'Courier New';
            case FontType.SegoeUI: return 'Segoe UI';
            case FontType.Calibri: return 'Calibri';
            case FontType.Roboto: return 'Roboto';
        }
    }
}