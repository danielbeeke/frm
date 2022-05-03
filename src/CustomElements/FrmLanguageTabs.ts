import { Settings } from '../types/Settings'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'

export const FrmLanguageTabs = (settings: Settings) => {
  return class FrmLanguageTabs extends HTMLElement {

    public settings: Settings
    public definition: LDflexPath
    
    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition and the 'field' definition.
     * When loading is done renders the widget.
     */
    async connectedCallback () {
      this.classList.add('language-tabs')
      this.render()
    }

    async render () {
      if (this.settings.internationalization.mode === 'mixed') return
      
      const currentLangCode = this.settings.internationalization.current
      const labels = this.settings.internationalization.languageLabels[currentLangCode]

      await render(this, html`
        <h3 class="title">${this.definition['rdfs:label']}</h3>

        <nav class="tabs">
          ${Object.entries(labels).map(([langCode, label]) => html`
            <button type="button" onclick=${() => {
              this.settings.internationalization.current = langCode
            }} class=${`tab ${currentLangCode === langCode ? 'active' : ''}`}>
              ${label}
            </button>
          `)}


        </ul>
      `)
    }

  }
}