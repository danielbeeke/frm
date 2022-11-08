import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { render, html } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { rdfToLDflex } from '../helpers/rdfToLDflex'
import { Store, DataFactory } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { ShapeToFields } from '../core/ShapeToFields'
import SHACLValidator from 'rdf-validate-shacl'
import { storeToTurtle } from '../helpers/storeToTurtle'
import { icon } from '../helpers/icon'
import { rdfType } from '../core/constants'
import { debounce } from '../helpers/debounce'
import { NamedNode } from 'n3'
import { PathFactory } from 'ldflex'
import handlers from '../helpers/ldFlexSettings'

const { namedNode } = DataFactory

const primaryColor = getComputedStyle(document.documentElement)
.getPropertyValue('--bs-primary') ??
getComputedStyle(document.documentElement)
.getPropertyValue('--color-primary') ??
'gray'

export class FrmForm extends HTMLElement {

  private settings: Settings
  static settings: Settings
  private shapeText: string
  private definition: ShapeDefinition
  private shapeSubject: string
  private dataText: string
  private data: LDflexPath
  private dataSubject: string | null
  private store: Store
  private engine: ComunicaEngine
  public validationReport: any
  private validator: SHACLValidator
  public isReady: boolean
  private latestMessage: string = 'Loading'
  private context : any
  private theme: any

  constructor () {
    super()
    this.settings = FrmForm.settings
    this.theme = this.settings.templates.apply.bind(this.settings.templates)
  }

  /**
   * Loads the shape definition.
   */
  async connectedCallback () {
    this.latestMessage = await this.settings.translator.t('loading-form') ?? ''

    this.classList.add('loading')
    render(this, this.loadingBanner())
     
    this.shapeText = await resolveAttribute(this, 'shape')

    this.shapeSubject = this.getAttribute('shapesubject')! ?? this.getAttribute('shape')?.split('#').pop()
    if (!this.shapeSubject) throw new Error('Missing shape subject')

    this.definition = await new ShapeDefinition(this.settings, this.shapeText, this.shapeSubject)

    this.dataSubject = this.getAttribute('datasubject')! ?? this.getAttribute('data')?.split('#').pop()
    this.dataSubject = this.dataSubject ? this.settings.context.expandTerm(this.dataSubject) : 'urn:temp'

    this.dataText = await resolveAttribute(this, 'data') ?? ''
    const { path, store, engine, context } = await rdfToLDflex(this.dataText, this.dataSubject ?? 'urn:temp')
    this.data = path
    this.store = store
    this.context = context

    // When adding a new thing we should make sure the type is set correctly.
    // If we do not do this, SHACL will not validate.
    if (!this.dataSubject) {
      const targetClass = await this.definition.shape['sh:targetClass'].value

      this.store.addQuad(
        namedNode('urn:temp'),
        namedNode(rdfType),
        namedNode(targetClass)
      )
    }

    this.engine = engine

    this.validator = new SHACLValidator(this.definition.store, {
      // @types/rdf-validate-shacl is behind.
      /** @ts-ignore */
      allowNamedNodeInList: true,
    })

    const debouncedRenderForEvents = debounce(() => {
      this.render()
    }, 100)

    this.addEventListener('value-deleted', debouncedRenderForEvents)
    this.addEventListener('value-changed', debouncedRenderForEvents)
    this.addEventListener('value-added', debouncedRenderForEvents)
    this.settings.internationalization.addEventListener('language-changed', debouncedRenderForEvents)
    return this.render()
  }

  /**
   * Change of the URI of the main subject.
   * @param uri 
   */
  async setDataSubject (uri: string) {
    for (const quad of this.store.match(namedNode(this.dataSubject!), null, null)) {
      this.store.removeQuad(quad)
      this.store.addQuad(
        namedNode(uri),
        quad.predicate,
        quad.object
      );
    }

    const path = new PathFactory({ context: this.context, queryEngine: this.engine, handlers })
    const subject = new NamedNode(uri)
    this.data = path.create({ subject })
    this.dataSubject = uri
  }


  /**
   * Validates the whole form input data
   */
  validate () {
    this.validationReport = this.validator.validate(this.store)
    this.settings.logger.log('Created validation report')
  }

  /**
   * The loading banner
   */
  loadingBanner () {
    return html`
    <div class="loading-banner">
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
    const { fields, ready } = await ShapeToFields(
      this.settings, 
      this.definition, 
      this.shapeSubject, 
      this.data, 
      null, 
      this.store, 
      this.engine, 
      true
    )

    if (!this.isReady) {
      ready.then(async () => {
        if (!this.isReady) {
          this.dispatchEvent(new CustomEvent('ready'))
          this.settings.logger.log(`FRM is ready`)
          this.isReady = true
          this.classList.remove('loading')
        }
      })  
    }

    const formErrors = this.validationReport?.results
    .filter(error =>  error.path == null) ?? []

    await render(this, html`
      ${!this.isReady ? this.loadingBanner() : null}

      <form>
      ${fields}

      ${this.theme('container', {
        inner: html`
          <div class="form-actions">
            ${this.theme('button', {
              isSubmit: true,
              context: 'form-submit',
              callback: async (event: InputEvent) => {
                event.preventDefault()

                const presaveEvent = new CustomEvent('presave', {
                  detail: { promises: [] }
                })

                this.dispatchEvent(presaveEvent)
                await Promise.all(presaveEvent.detail.promises)

                const turtle = await storeToTurtle(this.store)

                const details = {
                  detail: {
                    validated: this.validationReport.conforms,
                    turtle,
                    store: this.store,
                    validationReport: this.validationReport
                  }
                }

                this.dispatchEvent(new CustomEvent('submit', details))  
              },
              inner: this.settings.translator.t('submit')
            })}
          </div>
        `,
        context: 'form-actions'
      })}
    `)
  }
}

export const init = (settings: Settings) => {
  FrmForm.settings = settings 
  customElements.define('frm-form', FrmForm)
}