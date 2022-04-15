import { WidgetBase } from './WidgetBase'
import { ValueRangeConstraints } from '../core/shaclProperties'

export class GeocodingAddressWidget extends WidgetBase {

  static supportedDataTypes = []
  static supportedProperties = [...ValueRangeConstraints]
  static requiredProperties = ['addressLocality', 'addressRegion', 'postalCode', 'streetAddress']
  static requiredSettingsKeys = ['positionstack']

}