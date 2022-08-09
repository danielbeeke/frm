import { GrouperBase } from '../Groupers/GrouperBase'
import { Settings } from '../types/Settings'
import { LDflexPath } from '../types/LDflexPath'

export const init = (settings: Settings) => {
  class FrmGrouper extends HTMLElement {

    private grouper: GrouperBase
    private settings: Settings
    private items: any
    public templates: { [key: string]: any }
    #values: LDflexPath

    constructor () {
      super()
      this.settings = settings
    }

    /**
     * Loads the shape definition and the 'field' definition.
     * When loading is done renders the widget.
     */
    async connectedCallback () {
      this.grouper = await new this['grouper-type'](this.settings, this)
      this.grouper.render()
    }

    set values (values) {
      this.#values = values
      if (this.grouper) {
        this.grouper.values = values()
      }
    }

    get values () {
      return this.#values
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