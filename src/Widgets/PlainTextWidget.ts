import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'

export class PlainTextWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:rows', 'html:placeholder']
  static commonNames = ['description', 'abstract', 'text']

}