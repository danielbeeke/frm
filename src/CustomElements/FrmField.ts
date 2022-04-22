import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { WidgetBase } from '../Widgets/WidgetBase'

export const init = (settings: Settings) => {
  class FrmField extends HTMLElement {

    private predicate: string
    private shapesubject: string
    private shape: ShapeDefinition
    private definition: LDflexPath
    private values: LDflexPath
    private settings: Settings
    private widget: WidgetBase
    
    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition and the 'field' definition.
     * When loading is done renders the widget.
     */
    async connectedCallback () {
      this.classList.add('loading')

      if (!this.predicate)
        this.predicate = this.getAttribute('predicate')!
      if (!this.predicate) throw new Error('Missing predicate')
  
      if (!this.shapesubject)
        this.shapesubject = this.getAttribute('shapesubject')!
      if (!this.shapesubject) throw new Error('Missing shape subject')
  
      // The shape may have been given by the <frm-form>
      if (!this.shape) {
        const shapeText = await resolveAttribute(this, 'shape')
        this.shape = await new ShapeDefinition(this.settings, shapeText, this.shapesubject)  
      }

      if (!this.definition) {
        this.definition = await this.shape.getShaclProperty(this.predicate)
      }

      const widgetName = await this.definition['frm:widget'].value
      this.setAttribute('widget', widgetName)

      if (!this.settings.widgets[widgetName]) throw new Error(`Missing widget type: ${widgetName}`)
      this.widget = await new this.settings.widgets[widgetName](this.settings, this, this.predicate, this.definition, this.values)

      await this.widget.render()
      this.classList.remove('loading')
    }
  }
  
  customElements.define('frm-field', FrmField)
}