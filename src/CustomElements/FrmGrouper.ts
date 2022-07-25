import { GrouperBase } from '../Groupers/GrouperBase'
import { Settings } from '../types/Settings'

export const init = (settings: Settings) => {
  class FrmGrouper extends HTMLElement {

    private grouper: GrouperBase
    private templates: Array<any>
    private settings: Settings
    
    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition and the 'field' definition.
     * When loading is done renders the widget.
     */
    async connectedCallback () {
      this.grouper = await new this['grouper-type'](this.settings, this.templates, this)
      this.grouper.render()
    }

    get isReady () {
      if (!this.grouper) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            await this.isReady
            resolve(null)
          }, 100)
        })
      }

      return new Promise(async (resolve) => {
        await this.grouper.render()
        resolve(null)
      })
    }

  }
  
  customElements.define('frm-grouper', FrmGrouper)
}