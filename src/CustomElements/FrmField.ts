import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { Settings } from '../types/Settings'
import { resolveAttribute } from '../helpers/resolveAttribute'
import { WidgetBase } from '../Widgets/WidgetBase'
import { Literal, Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'

export class FrmField extends HTMLElement {

  private predicate: string
  private shapesubject: string
  private shape: ShapeDefinition
  private definition: LDflexPath
  #values: LDflexPath
  private settings: Settings
  static settings: Settings
  private widget: WidgetBase
  public store: Store
  public engine: ComunicaEngine
  public isReadyPromise: Promise<void>
  public errors: any

  constructor () {
    super()
    this.settings = FrmField.settings
  }

  connectedCallback () {
    this.isReadyPromise = this.connectedCallbackAction()
  }

  /**
   * Loads the shape definition and the 'field' definition.
   * When loading is done renders the widget.
   */
  async connectedCallbackAction () {
    this.classList.add('loading')
    this.dataset.subject = this.settings.context.compactIri(this.shapesubject)
    this.dataset.predicate = this.settings.context.compactIri(this.predicate)

    if (!this.predicate)
      this.predicate = this.getAttribute('predicate')!
    if (!this.predicate) throw new Error('Missing predicate')

    if (!this.shapesubject)
      this.shapesubject = this.getAttribute('shapesubject')!
    if (!this.shapesubject) throw new Error('Missing shape subject')

    // The shape may have been given by the <frm-form>
    if (!this.shape) {
      const shapeText = await resolveAttribute(this, 'shape')
      this.shape = await new ShapeDefinition(this.settings, shapeText, this.shapesubject)  
    }

    if (!this.definition) {
      this.definition = await this.shape.getShaclProperty(this.predicate)
    }

    const widgetName = await this.definition['frm:widget'].value
    this.setAttribute('widget', widgetName)

    if (!this.settings.widgets[widgetName]) throw new Error(`Missing widget type: ${widgetName}`)
    this.widget = await new this.settings.widgets[widgetName](this.settings, this, this.predicate, this.definition, this.values, this.store, this.engine, widgetName)

    await this.widget.render()
    this.classList.remove('loading')

    if (this.settings.afterRender) this.settings.afterRender()
  }

  set values (values) {
    this.#values = values
    if (this.widget) {
      values().then((valuesFetcher) => {
        this.widget.values = valuesFetcher()
      })
    }
  }

  get values () {
    return this.#values
  }

  get isReady () {
    if (!this.widget) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.isReady
          resolve(this.widget)
        }, 100)
      })
    }

    return this.isReadyPromise
  }

  async setValue (newValue: Array<Literal> | Literal) {
    newValue = Array.isArray(newValue) ? newValue : [newValue]
    let index = 0

    // Replacements and deletions
    for await (const oldValue of this.widget.values) {
      if (newValue[index]) {
        this.widget.setValue(newValue[index], oldValue)
      }
      else {
        this.widget.removeItem(oldValue)
      }

      index++
    }

    // Additions
    if (index < newValue.length) {
      for (let i = index; i < newValue.length; i++) {
        this.widget.setValue(newValue[index])
      }
    }
  }

  getValue () {
    return this.widget.values
  }

}

export const init = (settings: Settings) => {
  FrmField.settings = settings
  customElements.define('frm-field', FrmField)
}