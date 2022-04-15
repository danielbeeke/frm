import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { lastPart as lastPartOriginal } from '../helpers/lastPart'
import { flexify } from '../helpers/LDflexToString'
import { icon } from '../helpers/icon'
import { attributesDiff } from '../helpers/attributesDiff'
const lastPart = flexify(lastPartOriginal)

export abstract class WidgetBase {
  
  static supportedDataTypes: Array<string> = []
  static supportedDataTypesCallback = intersectionCount
  
  static supportedProperties: Array<string> = []
  static supportedPropertiesCallback = intersectionCount

  static requiredProperties: Array<string> = []
  static requiredPropertiesCallback = intersectionCount

  static commonNames: Array<string> = []
  static commonNamesCallback = (name, commonNames) => commonNames.some(commonName => name.toLowerCase().includes(commonName.toLowerCase())) ? 1 : 0

  public host: HTMLElement
  public definition: LDflexPath
  public data: LDflexPath
  public settings: Settings
  public t: (key: string, tokens: {[key: string]: any}) => Promise<string | undefined>

  private expandedDescription: boolean = false

  public inputAttributes = {
    class: 'input',
    type: 'text'
  }

  constructor (settings: Settings, host: HTMLElement, definition: ShapeDefinition, data: LDflexPath) {
    this.settings = settings
    this.host = host
    this.definition = definition
    this.data = data
    this.t = settings.translator.t.bind(settings.translator)

    /** @ts-ignore */
    return this.init().then(() =>this)
  }

  public async init () {}

  async attributes () {
    const attributeObjects: Array<{}> = []
    for (const transformer of Object.values(this.settings.attributeTransformers)) {
      const attributeObject = await transformer.transform(this.data, this.definition)
      attributeObjects.push(attributeObject)
    }

    return attributesDiff(Object.assign({}, this.inputAttributes, ...attributeObjects))
  }

  /**
   * Templates
   */
  fieldLabel () {
    return html`<h5 class="label">
      ${this.definition['sh:name|rdfs:label']}

      ${this.button({
        inner: icon('info'),
        action: () => { this.expandedDescription = !this.expandedDescription; this.render() },
      })}
    </h5>`
  }

  fieldDescription () {
    return html`
    <div class="description">
      <h6 class="title">${this.t('field-description-label', { predicate: lastPart(this.definition['sh:path']) })}</h6>
      ${this.definition['sh:comment|rdfs:comment']}
    </div>
    `
  }

  items () {
    return html`
      <div class="items">
        ${this.data.map(value => html`
          <div class="item">
            <div class="input-group">
              ${this.item(value)}
              ${this.itemRemoveButton()}
            </div>
          </div>
        `)}
      </div>
    `
  }

  /**
   * Please use this method to render buttons, 
   * it will help others to adjust Frm to use bootstrap or other a css framework.
   */
  button ({ inner, action, cssClasses }: { 
    inner: any, action: Function, cssClasses?: Array<string> 
  }) {
    if (!cssClasses) cssClasses = ['button', 'primary']
    return html`<button type="button" onclick=${action} class=${cssClasses.join(' ')}>
      ${inner}
    </button>`
  }

  /**
   * The button to remove one item
   */
  itemRemoveButton () {
    return this.button({
      inner: icon('x'),
      action: () => {},
      cssClasses: ['button', 'danger']
    })
  }

  async item (value: LDflexPath) {
    return html`<input ref=${this.attributes()} />`
  }

  render () {
    return render(this.host, html`
      ${this.fieldLabel()}
      ${this.expandedDescription ? this.fieldDescription() : html``}
      ${this.items()}
    `)
  }

}