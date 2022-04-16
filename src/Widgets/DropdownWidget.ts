import { WidgetBase } from './WidgetBase'
import { intersectionCount } from '../helpers/intersectionCount'
import { LDflexPath } from '../types/LDflexPath'

export class DropdownWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = ['html:placeholder', 'sh:in', 'sh:sparql']
  static requiredProperties = ['sh:in', 'sh:sparql'] // Only one is required
  static requiredPropertiesCallback = (a: Array<any>, b: Array<any>) => intersectionCount(a, b) ? 1 : -1
  static commonNames = ['options']

  public options: { [key: string]: string } = {}

  async init () {
    this.options = {}
    for (const value of await this.definition['sh:in'].list())
      this.options[value] = value.toString()
  }

  async item (value: LDflexPath) {
    return this.dropdown({
      placeholder: await this.definition['html:placeholder']?.value ?? this.t('select-a-value'),
      options: this.options,
      selectedValue: await value?.value,
      callback: async (event: InputEvent) => {
        await this.onChange(event, value)
        await this.render()
      }
    })
  }

}