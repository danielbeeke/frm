import { Settings } from '../types/Settings'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { render, html } from '../helpers/uhtml'

export const init = (settings: Settings) => {
  class FrmUri extends HTMLElement {

    private settings: Settings
    private shapeDefinition: ShapeDefinition

    constructor () {
      super()
      this.settings = settings
    }

    async connectedCallback () {
      this.render()
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

      const input = this.settings.templates.apply('input', {
        value: hasStarter && starterMatches ? givenDataSubject.replaceAll(cleanedPattern, '') : givenDataSubject,
        prefix: hasStarter && starterMatches || !givenDataSubject ? cleanedPattern : null,
        ref: element => {
          if (pattern && !hasStarter) element.setAttribute('pattern', pattern)
          element.setAttribute('required', null)
        },
        onchange: async (event: InputEvent) => {
          const input = (event.target as HTMLInputElement).value
          const value = hasStarter ? cleanedPattern + input : input
          await (this.closest('frm-form') as any).setDataSubject(value)
          this.render()
        },
        type: 'text'
      })

      const label = this.settings.templates.apply('label', this.settings.translator.t('uri-label'))

      render(this, html`
        ${label}
        ${this.settings.templates.apply('items', {
          items: [input]
        })}
      `)

    }

    get isReady () {
      return true
    }

  }
  
  customElements.define('frm-uri', FrmUri)
}