import { Settings } from '../types/Settings'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import 'bcp47-picker'

export const FrmLanguageTabs = (settings: Settings) => {
  return class FrmLanguageTabs extends HTMLElement {

    public settings: Settings
    public definition: LDflexPath
    public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>

    public expandedCreationForm: boolean = false

    constructor () {
      super()
      this.settings = settings
      this.t = settings.translator.t.bind(settings.translator)
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
          ${Object.entries(labels).map(([langCode, label]) => settings.templates.button({
            callback: () => {
              this.settings.internationalization.current = langCode
            },
            cssClasses: ['tab', currentLangCode === langCode ? 'active' : ''],
            inner: label
          }))}

          ${settings.templates.button({
            callback: () => {
              this.expandedCreationForm = !this.expandedCreationForm
              this.render()
            },
            inner: this.t('add-language')
          })}
        </nav>

        ${this.expandedCreationForm ? html`
          <bcp47-picker />
        ` : null}
      `)
    }

  }
}