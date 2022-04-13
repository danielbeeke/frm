import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { lastPart as lastPartOriginal } from '../helpers/lastPart'
import { flexify } from '../helpers/LDflexToString'
import { icon } from '../helpers/icon'
const lastPart = flexify(lastPartOriginal)

let css, t
export abstract class WidgetBase {
  
  static supportedDataTypes: Array<string> = []
  static supportedDataTypesCallback = intersectionCount
  
  static supportedProperties: Array<string> = []
  static supportedPropertiesCallback = intersectionCount

  static requiredProperties: Array<string> = []
  static requiredPropertiesCallback = intersectionCount

  static commonNames: Array<string> = []
  static commonNamesCallback = (name, commonNames) => commonNames.some(commonName => name.toLowerCase().includes(commonName.toLowerCase())) ? 1 : 0

  private host: HTMLElement
  private definition: LDflexPath
  private data: LDflexPath
  private settings: Settings

  private expandedDescription: boolean = false

  constructor (settings: Settings, host: HTMLElement, definition: ShapeDefinition, data: LDflexPath) {
    this.settings = settings
    this.host = host
    this.definition = definition
    this.data = data

    t = settings.translator.t.bind(settings.translator)
    css = settings.css
  }

  /**
   * Templates
   */

  async label () {
    return html`<h5 class=${css.fieldLabel}>
      ${this.definition['sh:name|rdfs:label']}

      <button onclick=${() => { 
        this.expandedDescription = !this.expandedDescription; this.render() 
      }} type="button" class=${css.buttonSubtleSmall}>
        ${icon('info')}
      </button>
    </h5>`
  }

  description () {
    return html`
    <div class=${css.fieldDescription}>
      <h6 class=${css.fieldDescriptionLabel}>${t('field-description-label', { predicate: lastPart(this.definition['sh:path']) })}</h6>
      ${this.definition['sh:comment|rdfs:comment']}
    </div>
    `
  }

  async items () {
    return html`
      <div class=${css.items}>
        ${this.data.map(value => html`
          <div class=${css.item}>
            <div class="input-group mb-3">
              ${this.item(value)}
              ${this.removeButton()}
            </div>
          </div>
        `)}
      </div>
    `
  }

  removeButton () {
    return html`<button class="btn btn-outline-danger" type="button">${icon('x')}</button>`
  }

  async item (value: LDflexPath) {
    return html`<input class=${css.input} type="text" />`
  }

  async render () {
    render(this.host, html`
      ${this.label()}
      ${this.expandedDescription ? this.description() : html``}
      ${this.items()}
    `)
  }

}