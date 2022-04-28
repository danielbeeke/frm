import { Settings } from '../types/Settings'
import { html, render } from '../helpers/uhtml'

export const FrmLanguageTabs = (settings: Settings) => {
  return class FrmLanguageTabs extends HTMLElement {

    public settings: Settings
    
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
      await render(this, html`Hello`)
    }

  }
}