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
import { debounce } from '../helpers/debounce';
import { FrmField } from '../CustomElements/FrmField';
import { FrmForm } from '../CustomElements/FrmForm';

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
  public host: FrmField
  public definition: LDflexPath
  public values: LDflexPath
  public predicate: string
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>

  public showEmptyItem: boolean = false
  public showAddButton: boolean = false
  public showRemoveButton: boolean = false
  public errorsExpanded: boolean = false

  public inputAttributes: {
    type: string,
  } = {
    type: 'text',
  }

  public showComment: boolean = false
  public engine: ComunicaEngine
  public store: Store
  public valuesFetcher: () => LDflexPath
  public theme: (templateName: string, ...args: any[]) => Hole | null
  public name: string
  public debouncedRender: Function

  constructor (
    settings: Settings, 
    host: FrmField, 
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
    const validationReport = (this.host.closest('frm-form') as FrmForm)?.validationReport
    const fieldErrors = validationReport?.results
    .filter(error => {
      return error.path?.value === this.predicate
    }) ?? []

    return fieldErrors
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
    this.showEmptyItem = false

    if (!oldValue) {
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
    if (value) {
      const term = await value.term
      await this.values.delete(term)
      this.host.dispatchEvent(new CustomEvent('value-deleted', { detail: { oldValue: term }, bubbles: true }))
    }
    await this.render()
  }

  async commentToggle () {
    if (!await this.definition['sh:comment|rdfs:comment']) return null

    return this.theme('button', {
      inner: icon('info'),
      context: 'toggle-description',
      callback: () => { this.showComment = !this.showComment; this.render() },
    })
  }

  async items (after: any) {
    const langCode = this.settings.internationalization.current
    const callback = ((value = null, index: number = -1) => this.item(value, index))

    const allowedDatatypes = [...await this.allowedDatatypes]

    const filteredValues = (await this.values.toArray()).filter(async value => {
      const valueLanguage = await value.language
      return allowedDatatypes.includes(translatableString) && valueLanguage === langCode || 
      !valueLanguage && !allowedDatatypes.includes(translatableString)
    })

    const renderItems = [...filteredValues.map(callback)]

    if (this.showEmptyItem) {
      renderItems.push(callback(null, 0))
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
    return this.showRemoveButton ? this.theme('button', {
      inner: icon('x'),
      callback: () => this.removeItem(value),
      context: 'remove-item'
    }) : null
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

  async commentTooltip () {
    const description = await this.definition['rdfs:comment']

    return description ? this.theme('tooltip', {
      icon: icon('info'),
      context: 'description',
      text: description
    }) : null
  }

  async description () {
    const description = await this.definition['sh:description']

    return description ? this.theme('small', {
      inner: description
    }) : null
  }

  async label () {
    return this.theme('label', {
      text: html`${await this.definition['sh:name|rdfs:label'] ?? lastPart(this.predicate)}`,
      inner: [
        await this.commentTooltip(),
        await this.errorTooltip(),
      ]
    })
  }

  async errors () {
    const errors = this.validationErrors.flatMap(error => error.message.map(message => message.value))
    return this.validationErrors?.length && this.errorsExpanded ? 
    this.theme('messages', { inner: errors, type: 'error' })
     : null
  }


  async preRender () {
    const uniqueLang = await this.definition['sh:uniqueLang'].value
    const langCode = this.settings.internationalization.current

    const filteredValues = (await this.values.toArray()).filter(async value => {
      const valueLanguage = await value.language
      return valueLanguage === langCode || langCode === false && !valueLanguage
    })

    const totalValueCount = (await this.values.toArray()).length
    const maxCountSetting = await this.definition['sh:maxCount'].value
    const maxCount = maxCountSetting ? parseInt(maxCountSetting) : Infinity
    const filteredValueCount = filteredValues.length
    if (filteredValueCount === 0) this.showEmptyItem = true

    this.showRemoveButton = filteredValueCount !== 0

    this.showAddButton = !(
      totalValueCount >= maxCount
      || uniqueLang && filteredValueCount
      || this.showEmptyItem
    )

    // console.log(this.predicate, {
    //   globalLangCode: langCode,
    //   totalValueCount,
    //   maxCount,
    //   uniqueLang,
    //   filteredValues,
    //   filteredValueCount,
    //   showEmptyItem: this.showEmptyItem,
    //   showAddButton: this.showAddButton
    // })

    if (this.validationErrors.length === 0) this.errorsExpanded = false
  }

  public async render () {
    await this.preRender()

    return render(this.host, html`
      ${this.label()}
      ${this.items(html`
      ${this.description()}
      ${await this.showAddButton ? this.addButton() : null}
      `)}
    `)
  }

}