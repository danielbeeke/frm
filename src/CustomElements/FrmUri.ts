import { Settings } from '../types/Settings'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { render, html } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import slug from 'limax';

export const init = (settings: Settings) => {
  class FrmUri extends HTMLElement {

    private settings: Settings
    private shapeDefinition: ShapeDefinition
    private definition: LDflexPath

    constructor () {
      super()
      this.settings = settings
    }

    async connectedCallback () {
      const populateFrom = await this.definition['frm:populateFrom'].value
      const compactedPopulateFrom = this.settings.context.compactIri(populateFrom)

      const form = (this.closest('frm-form') as HTMLElement)

      form.addEventListener(`value:${compactedPopulateFrom}`, async (event) => {
        const input = (event as CustomEvent).detail.newValue.value
        const langCode = (event as CustomEvent).detail.newValue.language
        if (langCode === 'en') await this.setSubject(input)  
      })
    }

    async render () {
      const pattern = await this.shapeDefinition.shape['sh:pattern'].value ?? ''
      let givenDataSubject = (this.closest('frm-form') as any)?.dataSubject

      if (givenDataSubject === 'urn:temp') givenDataSubject = ''

      // TODO improve parsing of the pattern.
      // I would love to parse to an AST and use the startsWith part of the Regex.
      const chars = ['^', '$', '.*']
      let cleanedPattern = pattern
      for (const char of chars) {
        cleanedPattern = cleanedPattern.replaceAll(char, '')
      }

      const hasStarter = pattern[0] === '^'
      const starterMatches = givenDataSubject.startsWith(cleanedPattern)
      const value = hasStarter && starterMatches ? givenDataSubject.replaceAll(cleanedPattern, '') : givenDataSubject

      const input = this.settings.templates.apply('input', {
        value,
        prefix: hasStarter && starterMatches || !givenDataSubject ? cleanedPattern : null,
        type: 'text',
        ref: element => {
          if (pattern && !hasStarter) element.setAttribute('pattern', pattern)
          element.setAttribute('required', null)
        },
        onchange: async (event: InputEvent) => {
          const input = (event.target as HTMLInputElement).value
          await this.setSubject(input)
        },
      })

      const label = this.settings.templates.apply('label', this.settings.translator.t('uri-label'))

      render(this, html`
        ${label}
        ${this.settings.templates.apply('items', {
          items: [input]
        })}
      `)
    }

    async setSubject (input: string) {
      input = slug(input)

      const pattern = await this.shapeDefinition.shape['sh:pattern'].value ?? ''
      let givenDataSubject = (this.closest('frm-form') as any)?.dataSubject

      if (givenDataSubject === 'urn:temp') givenDataSubject = ''

      // TODO improve parsing of the pattern.
      // I would love to parse to an AST and use the startsWith part of the Regex.
      const chars = ['^', '$', '.*']
      let cleanedPattern = pattern
      for (const char of chars) {
        cleanedPattern = cleanedPattern.replaceAll(char, '')
      }

      const hasStarter = pattern[0] === '^'

      const value = hasStarter ? cleanedPattern + input : input

      const form = (this.closest('frm-form') as any)

      await form.setDataSubject(value)
      await form.render()
    }

    get isReady () {
      return true
    }

  }
  
  customElements.define('frm-uri', FrmUri)
}