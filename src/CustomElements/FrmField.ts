import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { WidgetBase } from '../Widgets/WidgetBase'
import { rdfToLDflex } from '../helpers/rdfToLDflex'

export const init = (settings: Settings) => {
  class FrmField extends HTMLElement {

    private predicate: string
    private shapeSubject: string
    private shape: ShapeDefinition
    private definition: LDflexPath
    private data: LDflexPath
    private settings: Settings
    private widget: WidgetBase
    
    constructor () {
      super()
      console.time('a')
      this.settings = settings
    }

    /**
     * Loads the shape definition and the 'field' definition.
     * When loading is done renders the widget.
     */
    async connectedCallback () {
      console.time('widget')
      this.classList.add('loading-metadata')
      
      this.predicate = this.getAttribute('predicate')!
      if (!this.predicate) throw new Error('Missing predicate')
  
      this.shapeSubject = this.getAttribute('shapeSubject')!
      if (!this.shapeSubject) throw new Error('Missing shape subject')
  
      this.data = await rdfToLDflex('', '')

      const shapeText = await resolveAttribute(this, 'shape')
      this.shape = await new ShapeDefinition(this.settings, shapeText, this.shapeSubject)
      this.definition = this.shape.get(this.predicate)
      const widgetName = await this.definition['frm:widget'].id
      this.setAttribute('widget', widgetName)

      this.widget = new this.settings.widgets[widgetName](this, this.definition, this.data)

      this.removeAttribute('predicate')
      this.removeAttribute('shape')
      this.removeAttribute('shapeSubject')
      this.classList.remove('loading-metadata')

      this.widget.render()
      console.timeEnd('widget')
    }
  
  }
  
  customElements.define('frm-field', FrmField)
}