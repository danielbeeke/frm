import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'

export class DateWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:date']
  static supportedProperties = [...ValueRangeConstraints]
  static commonNames = ['date']

  async init () {
    this.inputAttributes.type = 'date'
  }
}