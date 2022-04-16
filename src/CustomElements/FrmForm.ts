import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { rdfToLDflex } from '../helpers/rdfToLDflex'

export const init = (settings: Settings) => {
  class FrmForm extends HTMLFormElement {

    private settings: Settings
    private shapeText: string
    private definition: ShapeDefinition
    private shapeSubject: string
    private dataText: string
    private data: LDflexPath
    private dataSubject: string

    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition.
     */
    async connectedCallback () {
      this.classList.add('loading')
       
      this.shapeSubject = this.getAttribute('shapesubject')!
      if (!this.shapeSubject) throw new Error('Missing shape subject')

      this.shapeText = await resolveAttribute(this, 'shape')
      this.definition = await new ShapeDefinition(this.settings, this.shapeText, this.shapeSubject)

      this.dataSubject = this.getAttribute('datasubject')!
      this.dataSubject = this.settings.context.expandTerm(this.dataSubject)!

      this.dataText = await resolveAttribute(this, 'data')
      this.data = await rdfToLDflex(this.dataText, this.dataSubject)

      this.classList.remove('loading')

      this.render()
    }

    async template (definition, shapeSubject) {
      return html`
        ${definition.shape['sh:property'].map(async predicatePath => {
          const predicate = await predicatePath['sh:path'].value

          return html`<frm-field
            .shape=${definition} 
            .shapesubject=${shapeSubject} 
            .predicate=${predicate} 
            .values=${() => this.data[predicate]}
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