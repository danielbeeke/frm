import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'

export class GeoWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:decimal', 'xsd:double', 'xsd:float']
  static supportedProperties = [...ValueRangeConstraints]
  static requiredProperties = ['latitude', 'longitude']

}