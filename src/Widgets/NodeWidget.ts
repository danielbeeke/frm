import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'
import { ShapeToFields } from '../core/ShapeToFields'
import { removeItemRecursively } from '../helpers/removeItemRecursively'
import { Literal, NamedNode } from 'n3'
import { skolemize } from '../helpers/skolemize'
import { html } from '../helpers/uhtml'
import { rdfType } from '../core/constants'

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
      this.store.addQuad(
        skolemizedNode, 
        new NamedNode(rdfType), 
        new Literal(targetClass), 
      )
    }

    await this.render()
  }

  async removeItem(value: LDflexPath = null) {
    await removeItemRecursively(this, value)
  }

  async item (value: LDflexPath) {
    const fields = await ShapeToFields(
      this.settings, 
      this.nodeShapeDefinition, 
      this.nodeShape, 
      this.values[this.predicate], 
      value, 
      this.store, 
      this.engine, 
      (this.host.closest('frm-form') as any)?.validationReport
    )

    return value ? html`
      ${fields}
      ${this.removeButton(value)}
    ` : null
  }

}