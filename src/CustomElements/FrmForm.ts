import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { html, render } from '../helpers/uhtml'

export const init = (settings: Settings) => {
  const { css } = settings

  class FrmForm extends HTMLElement {

    private shapeSubject: string
    private definition: ShapeDefinition
    private settings: Settings
    
    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition.
     */
    async connectedCallback () {
      this.classList.add(css.loading)
      css.form.split(' ').forEach(cssClass => this.classList.add(cssClass))
       
      this.shapeSubject = this.getAttribute('shapeSubject')!
      if (!this.shapeSubject) throw new Error('Missing shape subject')

      const shapeText = await resolveAttribute(this, 'shape')
      this.definition = await new ShapeDefinition(this.settings, shapeText, this.shapeSubject)

      this.classList.remove(css.loading)

      this.render()
    }

    async template () {
      return html`
        <form>
        ${await this.definition.shape['sh:property'].map(async predicatePath => {
          const predicate = await predicatePath['sh:path'].value
          return html`<frm-field 
            class=${css.field}
            .shape=${this.definition} 
            .shapesubject=${this.shapeSubject} 
            .predicate=${predicate} 
            ?debug=${this.hasAttribute('debug')} 
          />`
        })}
        </form>
      `
    }

    render () {
      render(this, this.template())
    }

  }
  
  customElements.define('frm-form', FrmForm)
}