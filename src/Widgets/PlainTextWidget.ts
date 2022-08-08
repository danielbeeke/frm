import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'

export class PlainTextWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:rows', 'html:placeholder']
  static commonNames = ['description', 'abstract', 'text']

  async item (value: LDflexPath, index: number) {
    return this.theme('textarea', value, this.attributes(), async (event: InputEvent) => {
      const allowedDatatypes = [...await this.allowedDatatypes]
      const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
      const languageOrDataType = this.settings.internationalization.current ? 
      this.settings.internationalization.current : 
      allowedDatatypes.length === 1 ? firstDatatype : undefined

      const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, languageOrDataType)
      this.setValue(newValue, value)
    }, html`
      ${this.removeButton(value)}
    `)
  }

}

