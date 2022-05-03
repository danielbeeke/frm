import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { render, html } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { rdfToLDflex } from '../helpers/rdfToLDflex'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { ShapeToFields } from '../core/ShapeToFields'
import SHACLValidator from 'rdf-validate-shacl'
import { button } from '../core/CommonTemplates'

export const init = (settings: Settings) => {
  class FrmForm extends HTMLElement {

    private settings: Settings
    private shapeText: string
    private definition: ShapeDefinition
    private shapeSubject: string
    private dataText: string
    private data: LDflexPath
    private dataSubject: string
    private store: Store
    private engine: ComunicaEngine
    private validationReport: any
    private validator: SHACLValidator

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
      const { path, store, engine } = await rdfToLDflex(this.dataText, this.dataSubject)
      this.data = path
      this.store = store
      this.engine = engine

      this.validator = new SHACLValidator(this.definition.store)
      this.classList.remove('loading')

      this.addEventListener('value-deleted', () => this.render())
      this.addEventListener('value-changed', () => this.render())
      this.settings.internationalization.addEventListener('language-changed', () => this.render())

      await this.render()
    }
    async render () {
      this.validationReport = this.validator.validate(this.store)

      await render(this, html`
        <form>
        ${ShapeToFields(
          settings, 
          this.definition, 
          this.shapeSubject, 
          this.data, 
          null, 
          this.store, 
          this.engine, 
          () => this.render(),
          this.validationReport
        )}

        ${button({
          isSubmit: true,
          callback: async (event: InputEvent) => {
            // if (this.validationReport.results.length) {
            //   event.preventDefault()
            // }
            
            // const turtle = await storeToTurtle(this.store)
            // console.log(turtle)
          },
          inner: settings.translator.t('submit')
        })}
      `)
    }

  }
  
  customElements.define('frm-form', FrmForm)
}