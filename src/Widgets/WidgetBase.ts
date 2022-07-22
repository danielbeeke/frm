import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import ComunicaEngine from '@ldflex/comunica'
import { Literal, Store } from 'n3';
import { Settings } from '../types/Settings'
import { icon } from '../helpers/icon'
import { attributesDiff } from '../helpers/attributesDiff'
import { Hole } from 'uhtml';
import { lastPart } from '../helpers/lastPart'

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

  public inputAttributes: {
    type: string,
  } = {
    type: 'text',
  }

  public showDescription: boolean = false
  public showEmptyItem: boolean = false
  public engine: ComunicaEngine
  public store: Store
  public parentRender: Function
  public valuesFetcher: () => LDflexPath
  public theme: (templateName: string, ...args: any[]) => Hole

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
    this.theme = settings.templates.apply.bind(settings.templates)

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

  async setValue (newValue: Literal, value: LDflexPath = null) {
    const oldValue = await value?.term

    if (!oldValue) {
      this.showEmptyItem = false
      await this.values.add(newValue)
      this.host.dispatchEvent(new CustomEvent('value-added', { detail: { newValue, oldValue }, bubbles: true }))
    }
    else if (oldValue) {
      if (!newValue) {
        await this.values.delete(oldValue)
        this.host.dispatchEvent(new CustomEvent('value-deleted', { detail: { newValue, oldValue }, bubbles: true }))
      }
      else {
        await this.values.replace(oldValue, newValue)
      }
      this.host.dispatchEvent(new CustomEvent('value-changed', { detail: { newValue, oldValue }, bubbles: true }))
    }

    await this.parentRender()
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
    await this.parentRender()
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
    const callback = ((value = null, index: number = -1) => this.item(value, index))

    const filteredValues = await this.values.filter(async value => {
      if (this.settings.internationalization.mode === 'mixed') return value

      const valueLanguage = await value.language
      return valueLanguage === this.settings.internationalization.current || !valueLanguage
    })

    const valueCount = (await this.values.toArray()).length
    let maxCount = parseInt(await this.definition['sh:maxCount'].value)

    const renderItems = [...filteredValues.map(callback)]
    if (!filteredValues.length && valueCount === maxCount)
      renderItems.push(this.t('no-more-values-not-allowed'))

    if (!filteredValues.length && valueCount < maxCount || this.showEmptyItem && !(await this.disabled()))
      renderItems.push(callback(null, valueCount))

    const resolvedRenderItems = await Promise.all(renderItems)

    return this.theme('items', resolvedRenderItems, after)
  }

  async item (value: LDflexPath, index: number) {
    return this.theme('input', {
      value,
      ref: this.attributes(),
      onchange: async (event: InputEvent) => {
        const allowedDatatypes = [...await this.allowedDatatypes]
        const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
        const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, allowedDatatypes.length === 1 ? firstDatatype : undefined)
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
      types.has('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') && 
      !types.has('http://www.w3.org/2001/XMLSchema#string')) return true
    return false
  }

  /**
   * The language selector, used in 'mixed' internationalization mode.
   */
  async l10nSelector (value: LDflexPath) {
    const currentLanguage = this.settings.translator.current
    const l10n = this.settings.internationalization.current

    if (l10n === false) return null
   
    const labels = this.settings.internationalization.languageLabels[currentLanguage]

    const languageLabel = await value?.value ? this.theme('small', await value?.language ? (labels[value.language] ?? value.language) : null) : null

    const valueHasLanguage = await value?.language

    // We allow the language selector if there is already a language.
    if (!valueHasLanguage && !(await this.allowedDatatypes).has('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')) return null

    if (this.settings.internationalization.mode === 'tabs') {

      const disabledToSwitch = true

      return html`
      ${await value?.value ? html`
      ${this.theme('button', {
        callback: async () => {
          const hadLanguage = await value?.language
          const rawValue = await value?.term?.value ?? ''
          const newTerm = this.settings.dataFactory.literal(rawValue, hadLanguage ? undefined : l10n)
          await this.setValue(newTerm, value)
        },
        cssClasses: [disabledToSwitch ? 'disabled' : ''],
        context: 'language-toggle',
        inner: html`
          ${icon('translate')}
          ${languageLabel}
          ${!disabledToSwitch ? (
            await value?.language ? icon('x') : icon('plus')
          ) : null}
        `
      })}
      ` : null}`
    }

    const settingsHasLanguages = Object.keys(this.settings.internationalization.languageLabels).length > 0
    if (!settingsHasLanguages) return null

    const optionLabels = this.settings.internationalization.languageLabels[l10n]

    const options = Object.assign({
      '': await this.t('translation-language-none')
    }, optionLabels)

    return html`
      ${this.theme('dropdown', {
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

  async errors () {
    const errors = this.validationErrors.flatMap(error => error.message.map(message => message.value))
    return this.validationErrors?.length && this.errorsExpanded ? 
    this.theme('messages', errors, 'error')
     : null
  }

  public async render () {
    await this.preRender()

    return render(this.host, html`
      ${this.theme('label', await this.definition['sh:name|rdfs:label'] ?? lastPart(this.predicate), [
        await this.descriptionTooltip(),
        await this.errorTooltip(),
      ])}
      ${this.items(await this.allowMultiple && !this.showEmptyItem ? this.addButton() : null)}
    `)
  }

}