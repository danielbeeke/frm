import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { html, render } from '../helpers/uhtml'

export const init = (settings: Settings) => {
  class FrmForm extends HTMLFormElement {

    private shapeSubject: string
    private definition: ShapeDefinition
    private settings: Settings
    private shapeText: string

    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition.
     */
    async connectedCallback () {
      this.classList.add('loading')
       
      this.shapeSubject = this.getAttribute('shapeSubject')!
      if (!this.shapeSubject) throw new Error('Missing shape subject')

      this.shapeText = await resolveAttribute(this, 'shape')
      this.definition = await new ShapeDefinition(this.settings, this.shapeText, this.shapeSubject)

      this.classList.remove('loading')

      this.render()
    }

    async template (definition, shapeSubject) {
      return html`
        ${await definition.shape['sh:property'].map(async predicatePath => {
          const predicate = await predicatePath['sh:path'].value
          return html`<frm-field 
            .shape=${definition} 
            .shapesubject=${shapeSubject} 
            .predicate=${predicate} 
            ?debug=${this.hasAttribute('debug')} 
          />`
        })}
      `
    }

    render () {
      render(this, this.template(this.definition, this.shapeSubject))
    }

  }
  
  customElements.define('frm-form', FrmForm, { extends: 'form' })
}