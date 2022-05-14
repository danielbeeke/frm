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
      const currentUILangCode = this.settings.translator.current
      const labels = this.settings.internationalization.languageLabels[currentUILangCode]

      const tabs = Object.entries(labels).map(([langCode, label]) => settings.templates.button({
        callback: () => {
          this.expandedCreationForm = false
          this.settings.internationalization.hideFields = false
          this.settings.internationalization.current = langCode
          this.render()
        },
        cssClasses: ['tab', currentLangCode === langCode && !this.expandedCreationForm ? 'active' : ''],
        inner: label
      }))

      tabs.push(settings.templates.button({
        callback: () => {
          this.settings.internationalization.hideFields = true
          this.expandedCreationForm = !this.expandedCreationForm
          this.render()
        },
        cssClasses: ['tab', this.expandedCreationForm ? 'active' : ''],
        inner: this.t('add-language')
      }))

      await render(this, html`
        ${this.settings.templates.label(this.definition['rdfs:label'])}
        ${this.settings.templates.tabs(tabs)}
        ${this.expandedCreationForm ? html`
          ${this.settings.templates.label(this.t('language'))}
          <bcp47-picker />
        ` : null}
      `)
    }

  }
}