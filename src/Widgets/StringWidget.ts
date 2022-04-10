import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'

export class StringWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder']
  static commonNames = ['label', 'name']

}