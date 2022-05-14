import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'

export class StringWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder']
  static commonNames = ['label', 'name']

  async item (value: LDflexPath) {
    return this.settings.templates.input(value, this.attributes(), async (event: InputEvent) => {
      const allowedDatatypes = [...await this.allowedDatatypes]
      const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
      const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, allowedDatatypes.length === 1 ? firstDatatype : undefined)
      this.setValue(newValue, value)
    }, 'text', html`
      ${this.l10nSelector(value)}
      ${this.removeButton(value)}
    `)
  }

}