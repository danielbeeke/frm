import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'

export class DateWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:date']
  static supportedProperties = [...ValueRangeConstraints]
  static commonNames = ['date']

}