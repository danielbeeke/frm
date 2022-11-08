import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { string, translatableString } from '../core/constants'

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
        const input = (event.target as HTMLInputElement).value
        const allowedDatatypes = [...await this.allowedDatatypes]
        const langCode = this.settings.internationalization.current

        let newValue

        if (
          allowedDatatypes.includes(string) && !allowedDatatypes.includes(translatableString) ||
          allowedDatatypes.includes(string) && allowedDatatypes.length === 1
        ) {
          newValue = this.settings.dataFactory.literal(input)
        }

        else if (allowedDatatypes.includes(translatableString) && allowedDatatypes.includes(string)) {
          const languageOrUndefined = langCode ? langCode : undefined
          newValue = this.settings.dataFactory.literal(input, languageOrUndefined)
        }

        else if (allowedDatatypes.includes(translatableString) && allowedDatatypes.length === 1 && langCode) {
          newValue = this.settings.dataFactory.literal(input, langCode)
        }
        
        if (newValue) {
          this.setValue(newValue, value)
        }
        else {
          throw new Error('No value was generated')
        }
      },
      suffix: html`
        ${this.removeButton(value)}
      `
    })
  }
  
}