import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'

export const init = (settings: Settings) => {
  class FrmField extends HTMLElement {

    private predicate: string
    private shape: ShapeDefinition
    private definition: LDflexPath
    private settings: Settings
  
    async connectedCallback () {
      this.settings = settings
      
      this.predicate = this.getAttribute('predicate') ?? ''
      if (!this.predicate) throw new Error('Missing predicate')
  
      const shapeSubject = this.getAttribute('shapeSubject')
      if (!shapeSubject) throw new Error('Missing shape subject')
  
      const shapeText = await this.resolveAttribute('shape')
      this.shape = await new ShapeDefinition(this.settings, shapeText, shapeSubject)
      this.definition = this.shape.get(this.predicate)
      this.setAttribute('widget', await this.definition['frm:widget'].value)
    }
  
    async resolveAttribute (attribute: string, required: boolean = false) {
      const attributeValue = this.getAttribute(attribute)!
      if (required && !attributeValue) throw new Error(`Missing HTML attribute: ${attribute}`)
  
      if (!['https', 'http', 'blob', '/'].some(protocol => attributeValue.startsWith(protocol))) return attributeValue
  
      const response = await fetch(attributeValue)
      return await response.text()
    }
  }
  
  customElements.define('frm-field', FrmField)
}