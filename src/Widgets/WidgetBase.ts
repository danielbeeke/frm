import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeDefinition } from '../core/ShapeDefinition'

export abstract class WidgetBase {
  
  static supportedDataTypes: Array<string> = []
  static supportedDataTypesCallback = intersectionCount
  
  static supportedProperties: Array<string> = []
  static supportedPropertiesCallback = intersectionCount

  static requiredProperties: Array<string> = []
  static requiredPropertiesCallback = intersectionCount

  static commonNames: Array<string> = []
  static commonNamesCallback = (name, commonNames) => commonNames.some(commonName => name.toLowerCase().includes(commonName.toLowerCase())) ? 1 : 0

  private host: HTMLElement
  private definition: LDflexPath
  private data: LDflexPath

  constructor (host: HTMLElement, definition: ShapeDefinition, data: LDflexPath) {
    this.host = host
    this.definition = definition
    this.data = data
  }

  /**
   * Templates
   */

  async label () {
    return html`<label>${this.definition.name}</label>`
  }

  async items () {
    return html`
      <div class="items">
        ${this.data.map(value => html`
          <div class="item">
            ${this.item(value)}
          </div>
        `)}
      </div>
    `
  }

  async item (value: LDflexPath) {
    return html`<input onchange=${(event) => {
      value.set(event.value)
    }} value=${value} />`
  }

  async render () {
    render(this.host, html`
      ${this.label()}
      ${this.items()}
    `)
  }

}