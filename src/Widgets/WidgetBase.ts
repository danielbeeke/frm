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
  
  /**
   * Start of properties that are used by the widgetsMatcher
   */
  static supportedDataTypes: Array<string> = []
  static supportedDataTypesCallback = intersectionCount
  
  static supportedProperties: Array<string> = []
  static supportedPropertiesCallback = intersectionCount

  static requiredProperties: Array<string> = []
  static requiredPropertiesCallback = intersectionCount

  static commonNames: Array<string> = []
  static commonNamesCallback = (name, commonNames) => commonNames
    .some(commonName => name.toLowerCase().includes(commonName.toLowerCase())) ? 1 : 0
  /**
   * End of properties that are used by the widgetsMatcher
   */

  public settings: Settings
  public host: HTMLElement
  public definition: LDflexPath
  public values: LDflexPath
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>

  public inputAttributes = {
    class: 'input',
    type: 'text'
  }

  public showDescription: boolean = false
  public showEmptyItem: boolean = false

  constructor (settings: Settings, host: HTMLElement, definition: ShapeDefinition, values: LDflexPath) {
    this.settings = settings
    this.host = host
    this.definition = definition
    this.values = values()
    this.t = settings.translator.t.bind(settings.translator)

    /** @ts-ignore */
    return this.init().then(() => this)
  }

  public async init () {}

  async attributes () {
    const attributeObjects: Array<{}> = []
    for (const transformer of Object.values(this.settings.attributeTransformers))
      attributeObjects.push(await transformer.transform(this.values, this.definition))

    return attributesDiff(Object.assign({}, this.inputAttributes, ...attributeObjects))
  }

  /**
   * Callbacks
   */
   async onChange (event: InputEvent, value: LDflexPath = null) {
    const textualValue = (event.target as HTMLInputElement).value
    const oldValue = await value?.value

    if (!oldValue && textualValue) {
      this.showEmptyItem = false
      await this.values.add(textualValue)
    }
    else if (oldValue && textualValue) {
      await this.values.replace(oldValue, textualValue)
    }

    await this.render()
  }

  /**
   * Templates
   */
  label () {
    return html`
      <h5 class="label">
        ${this.definition['sh:name|rdfs:label']}

        ${this.button({
          inner: icon('info'),
          callback: () => { this.showDescription = !this.showDescription; this.render() },
        })}
      </h5>
    `
  }

  description () {
    return html`
      <div class="description">
        <h6 class="title">${this.t('field-description-label', { 
          predicate: lastPart(this.definition['sh:path']) 
        })}</h6>
        ${this.definition['sh:comment|rdfs:comment']}
      </div>
    `
  }

  async items () {
    const callback = ((value = null) => html`
      <div class="item">
        <div class="input-group">
          ${this.item(value)}
          ${this.removeButton(value)}
        </div>
      </div>
    `)

    return html.for({})`
      <div class="items">
        ${this.values.map(callback)}
        ${!(await this.values.toArray()).length || this.showEmptyItem ? callback() : null}
      </div>
    `
  }

  async item (value: LDflexPath) {
    return html`
      <input 
        ref=${this.attributes()} 
        onchange=${(event: InputEvent) => this.onChange(event, value)} 
        .value=${value} 
      />
    `
  }

  /**
   * The button to remove one item
   */
   removeButton (value: LDflexPath) {
    return this.button({
      inner: icon('x'),
      callback: async () => {
        await this.values.delete(value)
        await this.render()
      },
      cssClasses: ['button', 'danger']
    })
  }

  /**
   * The button to remove one item
   */
   addButton () {
    return this.button({
      inner: icon('plus'),
      callback: () => {
        this.showEmptyItem = true
        this.render()
      },
      cssClasses: ['button', 'primary']
    })
  }

  /**
   * Generic button template
   */
  button ({ inner, callback, cssClasses }: { 
    inner: any, callback: Function, cssClasses?: Array<string> 
  }) {
    if (!cssClasses) cssClasses = ['button', 'primary']
    return html`
      <button type="button" onclick=${callback} class=${cssClasses.join(' ')}>
        ${inner}
      </button>
    `
  }

  /**
   * Generic dropdown template
   */
  dropdown ({ options, selectedValue = null, placeholder = null, callback = null }: {
    options: { [key: string]: string }, selectedValue: string | null, placeholder: string | null, callback?: Function | null
  }) {
    return html`
      <select onchange=${(event: InputEvent) => callback ? callback(event) : null}>
        ${!selectedValue ? html`<option selected disabled>${placeholder}</option>` : null}
        ${Object.entries(options).map(([value, label]) => html`
          <option value=${value} ?selected=${value === selectedValue ? true : null}>
            ${label}
          </option>
        `)}
      </select>
    `
  }

  render () {
    return render(this.host, html`
      ${this.label()}
      ${this.showDescription ? this.description() : html``}
      ${this.items()}
      ${this.addButton()}
    `)
  }

}