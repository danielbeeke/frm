import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'

export class DateWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:date']
  static supportedProperties = [...ValueRangeConstraints]
  static commonNames = ['date']

  async init () {
    this.inputAttributes.type = 'date'
  }

  async item (value: LDflexPath, index: number) {
    return this.theme('input', {
      value,
      ref: this.attributes(),
      onblur: async (event: InputEvent) => {
        const allowedDatatypes = [...await this.allowedDatatypes]
        const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
        const newValue = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, allowedDatatypes.length === 1 ? firstDatatype : undefined)
        this.setValue(newValue, value)
      },
      type: 'date',
      suffix: this.removeButton(value)
    })
  }
}