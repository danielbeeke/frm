import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { icon } from '../helpers/icon'

const expandedState = new Map()
const searchState = new Map()
const resultState = new Map()
const searchWordState = new Map()

export class ReferenceWidget extends WidgetBase {

  static supportedDataTypes = []
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder', 'frm:query']
  static commonNames = ['reference', 'uri']

  async item (value: LDflexPath, index: number) {
    const query = await this.definition['frm:query'].value
    const source = await this.definition['frm:source'].value

    const uri = await value?.term?.value
    const meta = uri ? await this.settings.referenceResolver.resolve(uri) : null

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
      suffix: html`
        ${applyButton}
        ${this.removeButton(value)}
      `
    })

    const searchResults = resultState.get(this.predicate + index) ?? []

    const searchField = this.theme('input', {
      type: 'search',
      value: searchWordState.get(this.predicate + index),
      onchange: async (event: InputEvent) => {
        const value = (event.target as HTMLInputElement).value
        searchWordState.set(this.predicate + index, value)
        const searchPromise = this.settings.referenceResolver.search(source, query, value)
        resultState.set(this.predicate + index, searchPromise)
        await this.render()
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
      searchResults,
      searchField,
      expanded,
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