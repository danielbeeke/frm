import { intersectionCount } from '../helpers/intersectionCount'

export abstract class WidgetBase {
  
  static supportedDataTypes: Array<string> = []
  static supportedDataTypesCallback = intersectionCount
  
  static supportedProperties: Array<string> = []
  static supportedPropertiesCallback = intersectionCount

  static requiredProperties: Array<string> = []
  static requiredPropertiesCallback = intersectionCount

  static commonNames: Array<string> = []
  static commonNamesCallback = (name, commonNames) => commonNames.some(commonName => name.toLowerCase().includes(commonName.toLowerCase())) ? 1 : 0

}