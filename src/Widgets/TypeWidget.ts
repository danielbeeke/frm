import { WidgetBase } from './WidgetBase'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'
import { lastPart } from '../helpers/lastPart'

export class TypeWidget extends WidgetBase {
  static supportedDataTypes = []
  static supportedProperties = []
  static commonNames = ['type']

  async item (value: LDflexPath, index: number) {
    const shapeTypeIsHardcodedInShape = await this.host.shape.shape['sh:targetClass'].value

    if (shapeTypeIsHardcodedInShape) {
      return html`
        <a href=${shapeTypeIsHardcodedInShape} target="_blank">${lastPart(shapeTypeIsHardcodedInShape)}</a>
      `
    }

    return this.theme('input', {
      value,
      ref: this.attributes(),
      onchange: async (event: InputEvent) => {
        const allowedDatatypes = [...await this.allowedDatatypes]
        const firstDatatype = this.settings.dataFactory.namedNode(allowedDatatypes[0])
        const newValue = this.settings.dataFactory.literal(
          (event.target as HTMLInputElement).value, 
          allowedDatatypes.length === 1 ? firstDatatype : undefined
        )
        this.setValue(newValue, value)
      },
      type: 'text',
      suffix: this.removeButton(value)
    })
  }

}