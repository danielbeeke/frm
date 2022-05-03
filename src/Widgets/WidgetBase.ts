import { intersectionCount } from '../helpers/intersectionCount'
import { html, render, Hole } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import ComunicaEngine from '@ldflex/comunica'
import { Literal, Store } from 'n3';
import { Settings } from '../types/Settings'
import { lastPart as lastPartOriginal } from '../helpers/lastPart'
import { flexify } from '../helpers/LDflexToString'
import { icon } from '../helpers/icon'
import { attributesDiff } from '../helpers/attributesDiff'
import { button, dropdown } from '../core/CommonTemplates'

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

  public errorsExpanded: boolean = false

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
    parentRender: Function,
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

  get validationErrors () {
    return this.host?.['errors'] ?? []
  }

  get allowedDatatypes () {
    return (async () => {
      const allowedDatatypes: Set<string> = new Set()
      for await(const datatype of this.definition['sh:datatype']) {
        allowedDatatypes.add(await datatype.value)
      }
  
      const orStatements = await this.definition['sh:or'].list()
      for (const orStatement of orStatements) {
        const datatype = await orStatement['sh:datatype'].value
        if (datatype) allowedDatatypes.add(datatype)
      }
      
      return allowedDatatypes
    })()
  }

  public async init () {}

  async attributes () {
    const attributeObjects: Array<{}> = []
    for (const transformer of Object.values(this.settings.attributeTransformers))
      attributeObjects.push(await transformer.transform(this.values, this.definition))
    const differ = attributesDiff(Object.assign({}, this.inputAttributes, ...attributeObjects))

    return (node) => {
      if (!this.validationErrors.length) {
        node.setCustomValidity('')
      }
      else {
        const messages = this.validationErrors.flatMap(error => error.message.map(message => message.value))
        node.setCustomValidity(messages.join('\n'))
      }

      differ(node)
    }
  }

  async preRender () {
    const valueCount = (await this.values.toArray()).length
    if (!this.showEmptyItem) this.showEmptyItem = valueCount === 0

    if (this.validationErrors.length === 0) this.errorsExpanded = false
  }

  /**
   * Getters
   */
  get allowMultiple () {
    return (async () => {
      const valueCount = (await this.values.toArray()).length
      let maxCount = await this.definition['sh:maxCount'].value
      if (maxCount === 'INF' || maxCount === undefined) maxCount = Infinity
      return valueCount < maxCount
    })()
  }

  async setValue (newValue: Literal, value: LDflexPath = null) {
    const oldValue = await value?.term

    if (!oldValue) {
      this.showEmptyItem = false
      await this.values.add(newValue)
      this.host.dispatchEvent(new CustomEvent('value-changed', { detail: { newValue, oldValue: null }, bubbles: true }))
    }
    else if (oldValue) {
      if (!newValue) {
        await this.values.delete(oldValue)
      }
      else {
        await this.values.replace(oldValue, newValue)
      }
      this.host.dispatchEvent(new CustomEvent('value-changed', { detail: { newValue, oldValue }, bubbles: true }))
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
      this.host.dispatchEvent(new CustomEvent('value-deleted', { detail: { oldValue: term }, bubbles: true }))
    }
    await this.render()
  }

  /**
   * Templates
   */
  label (inner: Array<Hole> = []) {
    return html`
      <h5 class="label">
        ${this.definition['sh:name|rdfs:label']}

        ${inner.filter(Boolean).length ? inner.filter(Boolean) : null}
      </h5>
    `
  }

  descriptionToggle () {
    return button({
      inner: icon('info'),
      callback: () => { this.showDescription = !this.showDescription; this.render() },
    })
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

    const filteredValues = await this.values.filter(async value => {
      if (this.settings.internationalization.mode === 'mixed') return value

      const valueLanguage = await value.language
      return valueLanguage === this.settings.internationalization.current || !valueLanguage
    })

    const valueCount = (await this.values.toArray()).length
    let maxCount = parseInt(await this.definition['sh:maxCount'].value)

    // uhtml does not understand what to cache here, so we break the cache on purpose.
    // TODO improve.
    return html.for({})`
      <div class="items">
        ${filteredValues.map(callback)}
        ${!filteredValues.length && valueCount === maxCount ? this.t('no-more-values-not-allowed') : null}
        ${!filteredValues.length && valueCount < maxCount || this.showEmptyItem ? callback() : null}
      </div>
    `
  }

  async item (value: LDflexPath) {
    return html`
      <input 
        ref=${this.attributes()} 
        onchange=${async (event: InputEvent) => {
          const allowedDatatypes = [...await this.allowedDatatypes]
          const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])

          const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, allowedDatatypes.length === 1 ? firstDatatype : undefined)
          this.setValue(newValue, value)
        }} 
        .value=${value} 
      />
    `
  }

  /**
   * The button to remove one item
   */
   removeButton (value: LDflexPath) {
    return button({
      inner: icon('x'),
      callback: () => this.removeItem(value),
      cssClasses: ['button', 'danger', value ? '' : 'disabled']
    })
  }

  /**
   * The button to remove one item
   */
   addButton () {
    return button({
      inner: icon('plus'),
      callback: () => this.addItem(),
      cssClasses: ['button', 'primary']
    })
  }

  /**
   * The language selector, used in 'mixed' internationalization mode.
   */
  async l10nSelector (value: LDflexPath) {
    const currentLanguage = this.settings.translator.current
    const labels = this.settings.internationalization.languageLabels[currentLanguage]

    const label = await value?.value ? html`
    <span class="language-label">
      ${await value?.language ? (labels[value.language] ?? value.language) : null}
    </span>
    ` : null
    
    const valueHasLanguage = await value?.language

    // We allow the language selector if there is already a language.
    if (!valueHasLanguage && !(await this.allowedDatatypes).has('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')) return null

    if (this.settings.internationalization.mode === 'tabs') {
      return html`
      ${await value?.value ? html`
      ${icon('translate')}
      ${label}
      ${button({
        callback: async () => {
          const hadLanguage = await value?.language
          const rawValue = await value?.term?.value ?? ''
          const newTerm = this.settings.dataFactory.literal(rawValue, hadLanguage ? undefined : this.settings.internationalization.current)
          await this.setValue(newTerm, value)
        },
        inner: await value?.language ? icon('x') : icon('plus')
      })}
      ` : null}`
    }

    const l10n = this.settings.internationalization.current
    const settingsHasLanguages = Object.keys(this.settings.internationalization.languageLabels).length > 0
    if (!settingsHasLanguages) return null

    const optionLabels = this.settings.internationalization.languageLabels[l10n]

    const options = Object.assign({
      '': await this.t('translation-language-none')
    }, optionLabels)

    return html`
      ${label}
      ${dropdown({
        options,
        selectedValue: value ? value.language : '',
        placeholder: await this.t('translation-language-placeholder') ?? '',
        callback: async (dropdownValue) => {
          if (value) {
            const rawValue = await value.term.value
            const newTerm = this.settings.dataFactory.literal(rawValue, dropdownValue ? dropdownValue : null)
            await this.setValue(newTerm, value)
          }
          else {
            const newTerm = this.settings.dataFactory.literal('', dropdownValue ? dropdownValue : null)
            await this.setValue(newTerm)
          }
          this.render()
        }
      })}
    `
  }

  async errorToggle () {
    return this.validationErrors?.length ? button({
      inner: icon('exclamationTriangleFill'),
      callback: () => {
        this.errorsExpanded = !this.errorsExpanded
        this.render()
      }
    }) : null
  }

  async errors () {
    return this.validationErrors?.length && this.errorsExpanded ? html`
      <ul>
      ${this.validationErrors.map(error => {
        return html`
          <li>${error.message.map(message => message.value)}</li>
        `
      })}
      </ul>
    ` : null
  }

  public async render () {
    await this.preRender()
    this.parentRender()

    return render(this.host, html`
      ${this.label([
        await this.descriptionToggle(),
        await this.errorToggle()
      ])}
      ${this.showDescription ? this.description() : html``}
      ${this.items()}
      ${(await this.allowMultiple) && !this.showEmptyItem ? this.addButton() : null}
      ${this.errors()}
    `)
  }

}