import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeToFields } from '../core/ShapeToFields';
import { removeItemRecursively } from '../helpers/removeItemRecursively';

export class NodeWidget extends WidgetBase {

  static supportedProperties = ['sh:node']

  public nodeShape: string
  public nodeShapeDefinition: ShapeDefinition
  public debug: boolean = false

  async init () {
    this.nodeShape = await this.definition['sh:node'].value
    this.predicate = await this.definition['sh:path'].value
    const shapeText = this.host.closest('frm-form')!['shapeText']
    this.nodeShapeDefinition = await new ShapeDefinition(this.settings, shapeText, this.nodeShape)
  }

  async addItem() {
    const node = this.settings.dataFactory.blankNode()
    await this.values.add(node)
    await this.render()
  }

  async removeItem(value: LDflexPath = null) {
    await removeItemRecursively(this, value)
  }

  async item (value: LDflexPath) {
    return ShapeToFields(this.settings, this.nodeShapeDefinition, this.nodeShape, this.values[this.predicate], value, this.store, this.engine, () => this.render())
  }

}