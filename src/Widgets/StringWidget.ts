import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { lastPart } from '../helpers/lastPart'

export class StringWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:string', 'rdf:langString']
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder']
  static commonNames = ['label', 'name']

  async item (value: LDflexPath) {
    return this.theme('input', {
      type: 'text',
      value,
      ref: this.attributes(),
      onchange: async (event: InputEvent) => {
        const allowedDatatypes = [...await this.allowedDatatypes]
        const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
        const languageOrDataType = this.settings.internationalization.current ? 
          this.settings.internationalization.current : 
          allowedDatatypes.length === 1 ? firstDatatype : undefined

        const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, languageOrDataType)

        this.setValue(newValue, value)
      },
      suffix: html`
        ${this.removeButton(value)}
      `
    })
  }
  
  async label () {
    return this.theme('label', html`
      ${await this.definition['sh:name|rdfs:label'] ?? lastPart(this.predicate)}
    `, [
      await this.descriptionTooltip(),
      await this.errorTooltip(),
    ])
  }

}