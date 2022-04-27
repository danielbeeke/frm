import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeToFields } from '../core/ShapeToFields'
import { removeItemRecursively } from '../helpers/removeItemRecursively'
import { Literal, NamedNode } from 'n3'
import { skolemize } from '../helpers/skolemize'

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

  async preRender () {}

  async addItem() {
    const node = this.settings.dataFactory.blankNode()
    const skolemizedNode = skolemize(node, 'urn:comunica_skolem:source_0')
    const targetClass = await this.nodeShapeDefinition.shape['sh:targetClass'].value
    await this.values.add(skolemizedNode)

    if (targetClass) {
      await this.store.addQuad(skolemizedNode, new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), new Literal(targetClass))
    }

    await this.render()
  }

  async removeItem(value: LDflexPath = null) {
    await removeItemRecursively(this, value)
  }

  async item (value: LDflexPath) {
    return value ? ShapeToFields(
      this.settings, 
      this.nodeShapeDefinition, 
      this.nodeShape, 
      this.values[this.predicate], 
      value, 
      this.store, 
      this.engine, 
      () => this.render()
    ) : null
  }

}