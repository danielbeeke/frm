import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import ComunicaEngine from '@ldflex/comunica'
import { Store } from 'n3';
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

  static requiredPredicates: Array<string> = []

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
  public predicate: string
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>

  public inputAttributes = {
    class: 'input',
    type: 'text'
  }

  public showDescription: boolean = false
  public showEmptyItem: boolean = false
  public engine: ComunicaEngine
  public store: Store
  public parentRender: Function
  public valuesFetcher: () => LDflexPath

  constructor (
    settings: Settings, 
    host: HTMLElement, 
    predicate: string, 
    definition: LDflexPath, 
    values: Promise<() => LDflexPath>,
    store: Store,
    engine: ComunicaEngine,
    parentRender: Function
  ) {
    this.predicate = predicate
    this.settings = settings
    this.host = host
    this.definition = definition
    this.t = settings.translator.t.bind(settings.translator)
    this.engine = engine
    this.store = store
    this.parentRender = parentRender ? parentRender : () => null

    /** @ts-ignore */
    return values().then((valuesCallback) => {
      this.valuesFetcher = valuesCallback
      this.values = this.valuesFetcher()
      return this.init().then(() => this)
    })
  }

  public async init () {}

  async attributes () {
    const attributeObjects: Array<{}> = []
    for (const transformer of Object.values(this.settings.attributeTransformers))
      attributeObjects.push(await transformer.transform(this.values, this.definition))
    return attributesDiff(Object.assign({}, this.inputAttributes, ...attributeObjects))
  }

  async preRender () {
    const valueCount = (await this.values.toArray()).length
    if (!this.showEmptyItem) this.showEmptyItem = valueCount === 0
  }

  /**
   * Getters
   */
  get allowMultiple () {
    return (async () => {
      const valueCount = (await this.values.toArray()).length
      let maxCount = await this.definition['sh:maxCount'].value
      if (maxCount === 'INF') maxCount = Infinity
      return valueCount < maxCount
    })()
  }

  async setValue (newRawValue: string | number, value: LDflexPath = null) {
    const dataType = await this.definition['sh:datatype'].value ? 
    this.settings.dataFactory.namedNode(await this.definition['sh:datatype'].value)
    : null
    const oldValue = await value?.value

    const isStringLiteral = dataType?.value === 'http://www.w3.org/2001/XMLSchema#string'
    const newValue = !isStringLiteral && dataType ? 
      this.settings.dataFactory.literal(newRawValue, dataType) : 
      this.settings.dataFactory.literal(newRawValue)

    if (!oldValue && newRawValue) {
      this.showEmptyItem = false
      // console.log(await this.values.add(newValue).sparql)
      await this.values.add(newValue)
    }
    else if (oldValue && newRawValue) {
      // console.log(await this.values.replace(oldValue, newValue).sparql)
      await this.values.replace(oldValue, newValue)
    }

    await this.render()
  }

  async addItem () {
    this.showEmptyItem = true
    await this.render()
  }

  async removeItem (value: LDflexPath | null = null) {
    if (!value) this.showEmptyItem = false
    else {
      const term = await value.term
      await this.values.delete(term)
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

    // uhtml does not understand what to cache here, so we break the cache on purpose.
    // TODO improve.
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
        onchange=${(event: InputEvent) => this.setValue((event.target as HTMLInputElement).value, value)} 
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
      callback: () => this.removeItem(value),
      cssClasses: ['button', 'danger', value ? '' : 'disabled']
    })
  }

  /**
   * The button to remove one item
   */
   addButton () {
    return this.button({
      inner: icon('plus'),
      callback: () => this.addItem(),
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
    options: { [key: string]: string }, 
    selectedValue: string | null, 
    placeholder: string | null, 
    callback?: Function | null
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

  public async render () {
    await this.preRender()
    this.parentRender()

    return render(this.host, html`
      ${this.label()}
      ${this.showDescription ? this.description() : html``}
      ${this.items()}
      ${(await this.allowMultiple) && !this.showEmptyItem ? this.addButton() : null}
    `)
  }

}