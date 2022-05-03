import { WidgetBase } from './WidgetBase'
import { LDflexPath } from '../types/LDflexPath'
import { Literal } from 'n3'

export class DropdownWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = ['html:placeholder', 'sh:in', 'sh:sparql']
  static requiredProperties = ['sh:in']
  static commonNames = ['options']

  public options: { [key: string]: Literal } = {}

  async init () {
    this.options = {}
    for (const value of await this.definition['sh:in'].list()) {
      this.options[await value.value] = await value.term
    }
  }

  async item (value: LDflexPath) {
    const selectOptions = {}
    for (const [value, term] of Object.entries(this.options)) {
      selectOptions[value] = term.value
    }

    // We allowed invalid values to be displayed. 
    // They will not pass validation when saving.
    const resolvedValue = await value?.value
    if (resolvedValue && !this.options[resolvedValue])
      selectOptions[resolvedValue] = resolvedValue


    return this.dropdown({
      placeholder: await this.definition['html:placeholder']?.value ?? this.t('select-a-value'),
      options: selectOptions,
      selectedValue: await value?.value,
      callback: async (dropdownValue: string) => {
        this.setValue(this.options[dropdownValue], value)
      }
    })
  }

}