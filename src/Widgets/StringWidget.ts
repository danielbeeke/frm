import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'

export class StringWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder']
  static commonNames = ['label', 'name']

  async item (value: LDflexPath) {
    return html`
      <input 
        ref=${this.attributes()} 
        onchange=${async (event: InputEvent) => {
          const term = this.settings.dataFactory.literal((event.target as HTMLInputElement).value)
          this.setValue(term, value)
        }} 
        .value=${value} 
      />

      ${this.l10nSelector(value)}
    `
  }

}