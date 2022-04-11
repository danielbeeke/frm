import { intersectionCount } from '../helpers/intersectionCount'
import { html, render } from 'htm/preact'
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

  constructor (host: HTMLElement, definition: ShapeDefinition) {
    this.host = host
    this.definition = definition
  }

  /**
   * Templates
   */

  async label () {
    return html`<label>${await this.definition['name'].value}</label>`
  }

  async render () {
    render(html`
      ${await this.label()}
    `, this.host)
  }

}