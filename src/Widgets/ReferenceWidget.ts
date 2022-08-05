import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { icon } from '../helpers/icon'

const expandedState = new Map()
const searchState = new Map()
const resultState = new Map()
const searchWordState = new Map()
const metaMap = new Map()

export class ReferenceWidget extends WidgetBase {

  static supportedDataTypes = []
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder', 'frm:query']
  static commonNames = ['reference', 'uri']

  async item (value: LDflexPath, index: number) {
    const query = await this.definition['frm:query'].value
    const source = await this.definition['frm:source'].value

    const uri = await value?.term?.value
    const meta = uri ? metaMap.get(uri) : null

    if (uri && !meta) {
      this.settings.referenceResolver.resolve(uri).then(resolvedMeta => {
        metaMap.set(uri, resolvedMeta)
        this.debouncedRender()
      })
      
    }

    const expanded = expandedState.get(uri)
    const searching = searchState.get(uri)

    let tempValue = uri

    const searchButton = this.theme('button', {
      inner: icon('search'),
      callback: async () => {
        searchState.set(uri, true)
        await this.render()
      },
      context: 'toggle-reference-label-edit'
    })

    const toggleButton = this.theme('button', {
      inner: icon('pencilFill'),
      callback: async () => {
        expandedState.set(uri, true)
        await this.render()
      },
      context: 'toggle-reference-label-edit'
    })

    const applyButton = this.theme('button', {
      inner: icon('check'),
      callback: async () => {
        expandedState.delete(uri)

        if (tempValue !== uri) {
          const newValue = this.settings.dataFactory.namedNode(tempValue)
          this.setValue(newValue, value)  
        }

        await this.render()
      },
      context: 'apply-reference-label-edit'
    })

    const field = this.theme('input', {
      type: 'text',
      value,
      ref: this.attributes(),
      onchange: async (event: InputEvent) => {
        tempValue = (event.target as HTMLInputElement).value
      },
      context: `expanded`,
      suffix: html`
        ${applyButton}
        ${this.removeButton(value)}
      `
    })

    const searchResults = resultState.get(this.predicate + index) ?? []

    const searchField = this.theme('input', {
      type: 'search',
      disableForce: true,
      placeholder: this.settings.translator.t('reference-search-placeholder'),
      value: searchWordState.get(this.predicate + index),
      onkeyup: async (event: InputEvent) => {
        const searchTerm = (event.target as HTMLInputElement).value
        searchWordState.set(this.predicate + index, searchTerm)
        const searchPromise = this.settings.referenceResolver.search(source, query, searchTerm)
        resultState.set(this.predicate + index, searchPromise)
        setTimeout(() => this.render(), 100)
      }
    })

    return this.theme('referenceLabel', {
      settings: this.settings,
      meta, 
      closeCallback: async () => {
        searchState.delete(uri)
        await this.render()
      },
      applySearchResult: async (uri: string) => {
        searchWordState.delete(this.predicate + index)
        resultState.delete(this.predicate + index)

        const newValue = this.settings.dataFactory.namedNode(uri)
        this.setValue(newValue, value)  

        await this.render()
      },
      loading: uri && !meta,
      searchResults,
      searchField,
      expanded,
      render: () => this.render(),
      field,
      searching,
      suffix: html`
        ${searchButton}
        ${this.removeButton(value)}
      `, 
      toggleButton
    })
  }

}