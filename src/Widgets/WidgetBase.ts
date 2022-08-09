import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import ComunicaEngine from '@ldflex/comunica'
import { Literal, NamedNode, Store } from 'n3';
import { Settings } from '../types/Settings'
import { icon } from '../helpers/icon'
import { attributesDiff } from '../helpers/attributesDiff'
import { Hole } from 'uhtml';
import { lastPart } from '../helpers/lastPart'
import { translatableString, string } from '../core/constants';
import { WidgetHtmlElement } from '../types/WidgetHtmlElement';
import { debounce } from '../helpers/debounce';

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
  public host: WidgetHtmlElement
  public definition: LDflexPath
  public values: LDflexPath
  public predicate: string
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>

  public errorsExpanded: boolean = false

  public inputAttributes: {
    type: string,
  } = {
    type: 'text',
  }

  public showDescription: boolean = false
  public showEmptyItem: boolean = false
  public engine: ComunicaEngine
  public store: Store
  public valuesFetcher: () => LDflexPath
  public theme: (templateName: string, ...args: any[]) => Hole | null
  public name: string
  public debouncedRender: Function

  constructor (
    settings: Settings, 
    host: WidgetHtmlElement, 
    predicate: string, 
    definition: LDflexPath, 
    values: Promise<() => LDflexPath>,
    store: Store,
    engine: ComunicaEngine,
    name: string
  ) {
    this.theme = settings.templates.apply.bind(settings.templates)

    this.name = name
    this.predicate = predicate
    this.settings = settings
    this.host = host
    this.definition = definition
    this.t = settings.translator.t.bind(settings.translator)
    this.engine = engine
    this.store = store

    this.debouncedRender = debounce(() => this.render(), 300)

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

    return async (node: HTMLInputElement) => {
      if (!this.validationErrors.length) {
        node.setCustomValidity('')
      }
      else {
        const messages = this.validationErrors.flatMap(error => error.message.map(message => message.value))
        node.setCustomValidity(messages.join('\n'))
      }

      if (await this.disabled()) {
        node.setAttribute('disabled', '')
      }
      else {
        node.removeAttribute('disabled')
      }

      differ(node)
    }
  }

  async preRender () {
    const langCode = this.settings.internationalization.current

    const filteredValues = await this.values.filter(async value => {
      const valueLanguage = await value.language
      return valueLanguage === langCode || langCode === false && !valueLanguage
    })
    if (this.validationErrors.length === 0) this.errorsExpanded = false
    this.showEmptyItem = await this.allowedToAddEmpty() && filteredValues.length === 0
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

  async getValue (index) {
    let counter = 0
    let item
    for await (const value of this.values) {
      if (counter === index)
        item = value
      counter++
    }
    return item
  }

  async setValue (newValue: Literal | NamedNode, value: LDflexPath = null) {
    const oldValue = await value?.term
    const predicate = this.predicate
    const compactedPredicate = this.settings.context.compactIri(predicate)

    if (!oldValue) {
      this.showEmptyItem = false
      await this.values.add(newValue)
      this.host.dispatchEvent(new CustomEvent('value-added', 
        { detail: { newValue, oldValue, predicate }, bubbles: true }))
    }
    else if (oldValue) {
      if (!newValue) {
        await this.values.delete(oldValue)
        this.host.dispatchEvent(new CustomEvent('value-deleted', 
          { detail: { newValue, oldValue, predicate }, bubbles: true }))
      }
      else {
        await this.values.replace(oldValue, newValue)
      }
      this.host.dispatchEvent(new CustomEvent('value-changed', 
        { detail: { newValue, oldValue, predicate }, bubbles: true }))
    }

    this.host.dispatchEvent(new CustomEvent('value', 
    { detail: { newValue, oldValue, predicate }, bubbles: true }))
    

    this.host.dispatchEvent(new CustomEvent(`value:${compactedPredicate}`, 
    { detail: { newValue, oldValue, predicate }, bubbles: true }))
    

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

  async descriptionToggle () {
    if (!await this.definition['sh:comment|rdfs:comment']) return null

    return this.theme('button', {
      inner: icon('info'),
      context: 'toggle-description',
      callback: () => { this.showDescription = !this.showDescription; this.render() },
    })
  }

  async items (after: any) {
    const langCode = this.settings.internationalization.current
    const callback = ((value = null, index: number = -1) => this.item(value, index))

    const allowedDatatypes = [...await this.allowedDatatypes]

    const filteredValues = await this.values.filter(async value => {
      const valueLanguage = await value.language
      return allowedDatatypes.includes(translatableString) && valueLanguage === langCode || 
      !valueLanguage && !allowedDatatypes.includes(translatableString)
    })

    const valueCount = (await this.values.toArray()).length
    const renderItems = [...filteredValues.map(callback)]

    if (this.showEmptyItem) {
      renderItems.push(callback(null, valueCount))
    }

    const resolvedRenderItems = await Promise.all(renderItems)

    return this.theme('items', {
      items: resolvedRenderItems, 
      after,
      contexts: [
        `items-${lastPart(this.predicate).toLowerCase()}`,
        `items-${this.name}`,
      ]
    })
  }

  async item (value: LDflexPath, index: number) {
    return this.theme('input', {
      value,
      ref: this.attributes(),
      onchange: async (event: InputEvent) => {
        const allowedDatatypes = [...await this.allowedDatatypes]
        const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
        const newValue = this.settings.dataFactory.literal(
          (event.target as HTMLInputElement).value, 
          allowedDatatypes.length === 1 ? firstDatatype : undefined
        )
        this.setValue(newValue, value)
      },
      type: 'text',
      suffix: this.removeButton(value)
    })
  }

  /**
   * The button to remove one item
   */
   removeButton (value: LDflexPath) {
    return this.theme('button', {
      inner: icon('x'),
      callback: () => this.removeItem(value),
      context: 'remove-item'
    })
  }

  /**
   * The button to remove one item
   */
   addButton () {
    return this.theme('button', {
      inner: icon('plus'),
      callback: () => this.addItem(),
      context: 'add-item'
    })
  }

  async disabled () {
    const types = await this.allowedDatatypes
    const l10n = this.settings.internationalization.current
    if (l10n === false && 
      types.has(translatableString) && 
      !types.has(string)) return true
    return false
  }

  async errorTooltip () {
    const errors = this.validationErrors.flatMap(error => error.message.map(message => message.value))

    return this.validationErrors?.length ? this.theme('tooltip', {
      icon: icon('exclamationTriangleFill'),
      context: 'errors',
      text: errors.join(', ')
    }) : null
  }

  async descriptionTooltip () {
    const description = await this.definition['sh:comment|rdfs:comment']

    return description ? this.theme('tooltip', {
      icon: icon('info'),
      context: 'description',
      text: description
    }) : null
  }

  async label () {
    return this.theme('label', html`
      ${await this.definition['sh:name|rdfs:label'] ?? lastPart(this.predicate)}
    `, [
      await this.descriptionTooltip(),
      await this.errorTooltip(),
    ])
  }

  async errors () {
    const errors = this.validationErrors.flatMap(error => error.message.map(message => message.value))
    return this.validationErrors?.length && this.errorsExpanded ? 
    this.theme('messages', errors, 'error')
     : null
  }

  public async render () {
    await this.preRender()

    /**
     * We hide fields that are not allowed to have no translation.
     */
    // const allowedDatatypes = await this.allowedDatatypes
    // const mustBeLanguage = allowedDatatypes.has(translatableString) && allowedDatatypes.size === 1
    // if (!await this.allowedToAddEmpty()) {
    //   return render(this.host, html``)
    // }

    return render(this.host, html`
      ${this.label()}
      ${this.items(await this.allowedToAddEmpty() && !this.showEmptyItem ? this.addButton() : null)}
    `)
  }

  async allowedToAddEmpty () {
    const uniqueLang = await this.definition['sh:uniqueLang'].value
    const langCode = this.settings.internationalization.current

    const filteredValues = await this.values.filter(async value => {
      const valueLanguage = await value.language
      return valueLanguage === langCode || langCode === false && !valueLanguage
    })

    const totalValueCount = (await this.values.toArray()).length
    const maxCount = parseInt(await this.definition['sh:maxCount'].value)
    const filteredValueCount = filteredValues.length

    if (maxCount === totalValueCount) return false
    if (uniqueLang && filteredValueCount) return false
    if (!(await this.allowMultiple)) return false

    return true
  }

}