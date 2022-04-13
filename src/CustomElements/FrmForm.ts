import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { html, render } from '../helpers/uhtml'

export const init = (settings: Settings) => {
  class FrmForm extends HTMLElement {

    private shapeSubject: string
    private definition: ShapeDefinition
    private settings: Settings
    private shapeAttribute: string
    
    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition.
     */
    async connectedCallback () {
      this.classList.add('loading-metadata')
  
      this.shapeSubject = this.getAttribute('shapeSubject')!
      if (!this.shapeSubject) throw new Error('Missing shape subject')

      this.shapeAttribute = this.getAttribute('shape')!
      const shapeText = await resolveAttribute(this, 'shape')
      this.definition = await new ShapeDefinition(this.settings, shapeText, this.shapeSubject)

      this.removeAttribute('shape')
      this.removeAttribute('shapesubject')
      this.classList.remove('loading-metadata')

      this.render()
    }

    async template () {
      return html`
        ${await this.definition.shape['sh:property'].map(async predicatePath => {
          const predicate = await predicatePath['sh:path'].value
          return html`<frm-field shape=${this.shapeAttribute} shapesubject=${this.shapeSubject} predicate=${predicate} />`
        })}
      `
    }

    render () {
      render(this, this.template())
    }

  }
  
  customElements.define('frm-form', FrmForm)
}