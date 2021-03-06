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
import { storeToTurtle } from '../helpers/storeToTurtle'
import { icon } from '../helpers/icon'

const primaryColor = getComputedStyle(document.documentElement)
.getPropertyValue('--bs-primary') ??
getComputedStyle(document.documentElement)
.getPropertyValue('--color-primary') ??
'gray'

export const init = (settings: Settings) => {
  const theme = settings.templates.apply.bind(settings.templates)
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
    public isReady: boolean
    private latestMessage: string = 'Loading'

    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition.
     */
    async connectedCallback () {
      this.latestMessage = await settings.translator.t('loading-form') ?? ''

      const loadingMessages = (event) => {
        this.latestMessage = (event as CustomEvent).detail.message
        render(this, this.loadingBanner())
      }

      this.settings.logger.addEventListener('message', loadingMessages)

      this.classList.add('loading')
      render(this, this.loadingBanner())
       
      this.shapeText = await resolveAttribute(this, 'shape')

      this.shapeSubject = this.getAttribute('shapesubject')! ?? this.getAttribute('shape')?.split('#').pop()
      if (!this.shapeSubject) throw new Error('Missing shape subject')

      this.definition = await new ShapeDefinition(this.settings, this.shapeText, this.shapeSubject)

      this.dataSubject = this.getAttribute('datasubject')! ?? this.getAttribute('data')?.split('#').pop()
      this.dataSubject = this.settings.context.expandTerm(this.dataSubject)!

      this.dataText = await resolveAttribute(this, 'data')
      const { path, store, engine } = await rdfToLDflex(this.dataText, this.dataSubject)
      this.data = path
      this.store = store
      this.engine = engine

      this.validator = new SHACLValidator(this.definition.store)

      this.addEventListener('value-deleted', () => this.render())
      this.addEventListener('value-changed', () => this.render())
      this.settings.internationalization.addEventListener('language-changed', () => this.render())

      await this.render()
      await this.readyPromise()
      this.classList.remove('loading')
      this.settings.logger.removeEventListener('message', loadingMessages)
      this.dispatchEvent(new CustomEvent('ready'))
      this.settings.logger.log(`FRM is ready`)
    }

    /**
     * Usefull for knowing when the whole for is loaded.
     */
    readyPromise () {
      const allFrmElements = [...this.getElementsByTagName("*")]
      .filter(node => node.nodeName.startsWith('FRM'))
      .map((element) => (element as  Element & { isReady: Promise<void>}).isReady)

      return Promise.all(allFrmElements).then(() => {
        this.isReady = true
        this.render()
      })
    }

    /**
     * Validates the whole form input data
     */
    validate () {
      this.validationReport = this.validator.validate(this.store)
    }

    /**
     * The loading banner
     */
    loadingBanner () {
      return html`
      <div class="loading-banner">
        <span class="me-3">
          ${this.latestMessage}
        </span>
        ${icon('loading', primaryColor)}
      </div>
      `
    }

    /**
     * Renders the form and all the sub elements.
     * @see ShapeToFields
     */
    async render () {
      this.validate()

      this.settings.logger.log(`Rendering from the root`)

      await render(this, html`
        ${!this.isReady ? this.loadingBanner() : null}

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

        ${theme('container', html`
          <div class="form-actions">
            ${theme('button', {
              isSubmit: true,
              context: 'form-submit',
              callback: async (event: InputEvent) => {
                event.preventDefault()

                const presaveEvent = new CustomEvent('presave', {
                  detail: {
                    promises: []
                  }
                })

                this.dispatchEvent(presaveEvent)
                await Promise.all(presaveEvent.detail.promises)

                console.log(this.validationReport)

                if (this.validationReport.results.length) {
                  event.preventDefault()
                }
                
                const turtle = await storeToTurtle(this.store)
                console.log(turtle)
              },
              inner: settings.translator.t('submit')
            })}
          </div>
        `, 'form-actions')}
      `)
    }

  }
  
  customElements.define('frm-form', FrmForm)
}