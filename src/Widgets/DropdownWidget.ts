import { WidgetBase } from './WidgetBase'
import { intersectionCount } from '../helpers/intersectionCount'

export class DropdownWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = ['html:placeholder', 'sh:in', 'sh:sparql']
  static requiredProperties = ['sh:in', 'sh:sparql'] // Only one is required
  static requiredPropertiesCallback = (a: Array<any>, b: Array<any>) => intersectionCount(a, b) ? 1 : -1
  static commonNames = ['options']

}