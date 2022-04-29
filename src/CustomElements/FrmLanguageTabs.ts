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
      await render(this, html`
        <h3>${this.definition['rdfs:label']}</h3>
      `)
    }

  }
}