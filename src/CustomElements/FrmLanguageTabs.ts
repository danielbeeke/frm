import { Settings } from '../types/Settings'
import { html, render, Hole } from '../helpers/uhtml'
import '../helpers/bcp47Picker'
import { LDflexPath } from '../types/LDflexPath'
import { icon } from '../helpers/icon'
import { parse } from 'bcp-47'

export const FrmLanguageTabs = (settings: Settings) => {
  const theme = settings.templates.apply.bind(settings.templates)

  return class FrmLanguageTabs extends HTMLElement {

    public settings: Settings
    public definition: LDflexPath
    public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>
    public picker: HTMLInputElement
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
      this.classList.add('language-picker')
      this.render()
    }

    async render () {
      if (this.settings.internationalization.mode === 'mixed') return
      
      const currentLangCode = this.settings.internationalization.current
      const currentUILangCode = this.settings.translator.current
      const labels = this.settings.internationalization.languageLabels[currentUILangCode] ?? []

      const languageNeutral = [theme('button', {
        callback: () => {
          this.expandedCreationForm = false
          this.settings.internationalization.current = false
          this.render()
        },
        context: 'language-tab',
        cssClasses: [currentLangCode === false ? 'active' : ''],
        inner: html`
          ${settings.translator.t('language-neutral')} ${icon('x')}
        `
      }), [currentLangCode === false ? 'active' : '']]


      const tabs: Array<Hole> = [
        languageNeutral
      ]

      const languageTabs = Object.entries(labels).map(([langCode, label]) => [theme('button', {
        callback: () => {
          this.expandedCreationForm = false
          this.settings.internationalization.current = langCode
          this.render()
        },
        context: 'language-tab',
        cssClasses: [currentLangCode === langCode ? 'active' : ''],
        inner: html`
          ${label} ${icon('x')}
        `
      }), [currentLangCode === langCode ? 'active' : '']])

      tabs.push(...languageTabs)

      tabs.push([theme('addLanguageTab', html`${icon('plus')} ${this.t('add-language')}`, async () => {
        this.expandedCreationForm = !this.expandedCreationForm
        await this.render()
        ;(document.querySelector('bcp47-picker') as HTMLInputElement)?.focus()    
      }), ['add-language-button']])

      await render(this, html`
        ${theme('label', this.definition['rdfs:label'])}
        ${theme('tabs', tabs, ['language-tabs'])}
        ${this.expandedCreationForm ? theme('addLanguagePopup', html`
          <bcp47-picker ref=${element => this.picker = element} />
          ${theme('button', {
            inner: this.t('add-language'),
            callback: async () => {
              const parsed = parse(this.picker.value)

              /** @ts-ignore */
              await settings.internationalization.addLanguage(this.picker.value, this.picker.getLabel(parsed), 'en')
              this.expandedCreationForm = false

              await this.render()
            },
            context: 'add-language-submit'
          })}
        `) : null}
      `)
    }

  }
}