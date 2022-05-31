import { Settings } from '../types/Settings'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { init } from 'bcp47-picker/src/init'
import { icon } from '../helpers/icon'

/* @ts-ignore */
const bcp47PickerSettings = {
  get sources () {
    return (async () => {
      return { 
        lmt: await fetch('https://bcp47.danielbeeke.nl/data/lmt.json')
          .then(response => response.json())
          .then((json) => new Map(json)), 
        grn: await fetch('https://bcp47.danielbeeke.nl/data/grn.json')
          .then(response => response.json())
          .then((json) => new Map(json)), 
      }
    })()
  },
  theme: {
    valueInput: 'form-control',
    valueContainer: 'input-group',
    base: 'bootstrap',
    valueContainerAdvanced: 'form-floating mb-3',
    showPartsButton: 'btn btn-outline-secondary',
    showSearchButton: 'btn btn-outline-secondary',
    backButton: 'btn btn-outline-secondary',
    results: 'list-group',
    resultItem: 'list-group-item list-group-item-action',
    code: 'badge rounded-pill bg-light text-dark',
    resultCount: 'input-group-text',
    collapseButton: 'btn btn-outline-secondary',
    expandButton: 'btn btn-outline-secondary',
    loading: 'loading',
    advanced: 'mt-4',
    advancedTitle: 'mb-2'
  }
}

/* @ts-ignore */
init(bcp47PickerSettings)

export const FrmLanguageTabs = (settings: Settings) => {
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
      const labels = this.settings.internationalization.languageLabels[currentUILangCode]

      const tabs = Object.entries(labels).map(([langCode, label]) => settings.templates.button({
        callback: () => {
          this.expandedCreationForm = false
          this.settings.internationalization.current = langCode
          this.render()
        },
        cssClasses: ['tab', currentLangCode === langCode ? 'active' : ''],
        inner: html`
          ${label} ${icon('x')}
        `
      }))

      tabs.push([html`<button class="btn btn-light btn-sm dropdown-toggle relative" style="z-index: 11" type="button" onclick=${async () => {
        this.expandedCreationForm = !this.expandedCreationForm
        await this.render()
        ;(document.querySelector('bcp47-picker') as HTMLInputElement)?.focus()
      }}>
        ${icon('plus')} ${this.t('add-language')}
      </button>`, ['add-language-button']])

      await render(this, html`
        ${this.settings.templates.label(this.definition['rdfs:label'])}
        ${this.settings.templates.tabs(tabs, ['language-tabs'])}
        ${this.expandedCreationForm ? html`
          <div class="fixed-bcp47-picker bg-light p-3 rounded shadow">
            <bcp47-picker ref=${element => this.picker = element} class="mb-3" />
            ${settings.templates.button({
              inner: this.t('add-language'),
              callback: async () => {
                /** @ts-ignore */
                settings.internationalization.addLanguage(this.picker.value, this.picker.label)
                this.expandedCreationForm = false
                await this.render()
              },
              cssClasses: ['button', 'primary', 'float-end']
            })}
          </div>
        ` : null}
      `)
    }

  }
}