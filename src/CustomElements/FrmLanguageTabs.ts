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
    }

    get isReady () {
      return this.render()
    }

    async render () {
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
        inner: html`${settings.translator.t('language-neutral')} ${icon('x')}`
      }), [currentLangCode === false ? 'active' : '']]

      const tabs: Array<Hole> = []

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

      tabs.push(...languageTabs) // languageNeutral

      tabs.push([theme('addLanguageTab', {
        inner: html`${icon('plus')} ${this.t('add-language')}`, 
        callback: async () => {
          this.expandedCreationForm = !this.expandedCreationForm
          await this.render()
  
          setTimeout(() => {
            const searchField = this.picker.querySelector('.bcp47-search') as HTMLInputElement
            // TODO Improve bcp47-picker so that we can call focus on the whole element.
            searchField?.focus()  
          }, 100)
        }
      }), ['add-language-button']])

      await render(this, html`
        ${theme('label', { text: this.definition['rdfs:label'] })}
        ${theme('tabs', {
          items: tabs, 
          extraCssClasses: ['language-tabs']
        })}
        ${this.expandedCreationForm ? theme('addLanguagePopup', {
          inner: html`
          <bcp47-picker ref=${(element: HTMLInputElement) => this.picker = element} />
          ${theme('button', {
            inner: this.t('add-language'),
            callback: async () => {
              // TODO Improve bcp47-picker so that we do not need to parse the value to get the label.
              const parsed = parse(this.picker.value)

              const formUri = (this.closest('frm-form') as any)?.shapeSubject

              /** @ts-ignore */
              await settings.internationalization.addLanguage(this.picker.value, this.picker.getLabel(parsed), 'en', formUri)
              this.expandedCreationForm = false
              this.settings.internationalization.current = this.picker.value
              await this.render()
            },
            context: 'add-language-submit'
          })}
        `
        }) : null}
      `)
    }

  }
}