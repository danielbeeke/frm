import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from '../core/ShapeDefinition'

let css, t
export class DateWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:date']
  static supportedProperties = [...ValueRangeConstraints]
  static commonNames = ['date']

  constructor (settings: Settings, host: HTMLElement, definition: ShapeDefinition, data: LDflexPath) {
    super(settings, host, definition, data)
    t = settings.translator.t.bind(settings.translator)
    css = settings.css
  }

  async item (value: LDflexPath) {
    return html`<input class=${css.input} type="date" />`
  }
}