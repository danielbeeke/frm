import { WidgetBase } from './WidgetBase'
import { LDflexPath } from '../types/LDflexPath'

export class DropdownWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = ['html:placeholder', 'sh:in', 'sh:sparql']
  static requiredProperties = ['sh:in']
  static commonNames = ['options']

  public options: { [key: string]: string } = {}

  async init () {
    this.options = {}
    for (const value of await this.definition['sh:in'].list())
      this.options[value] = value.toString()
  }

  async item (value: LDflexPath) {
    const itemOptions = {...this.options}

    // We allowed invalid values to be displayed. 
    // They will not pass validation when saving.
    const resolvedValue = await value?.value
    if (resolvedValue && !this.options[resolvedValue])
      itemOptions[resolvedValue] = resolvedValue
      
    return this.dropdown({
      placeholder: await this.definition['html:placeholder']?.value ?? this.t('select-a-value'),
      options: itemOptions,
      selectedValue: await value?.value,
      callback: async (event: InputEvent) => this.setValue((event.target as HTMLInputElement).value, value)
    })
  }

}