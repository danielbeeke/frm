import { html } from '../helpers/uhtml'
import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'
import { QueryEngine } from '@comunica/query-sparql-solid';
import { Store } from 'n3';
import { FieldInstances } from '../core/FieldInstances';
import { BindingsFactory } from '@comunica/bindings-factory';

const BF = new BindingsFactory();

export class NodeWidget extends WidgetBase {

  static supportedProperties = ['sh:node']

  public nodeShape: string
  public predicate: string
  public nodeShapeDefinition: ShapeDefinition
  public debug: boolean = false
  public engine: QueryEngine
  public store: Store

  async init () {
    this.nodeShape = await this.definition['sh:node'].value
    this.predicate = await this.definition['sh:path'].value
    this.engine = this.host.closest('frm-form')!['engine']['engine']
    this.store = this.host.closest('frm-form')!['store']
    const shapeText = this.host.closest('frm-form')!['shapeText']
    this.nodeShapeDefinition = await new ShapeDefinition(this.settings, shapeText, this.nodeShape)
  }

  async addItem() {
    const node = this.settings.dataFactory.blankNode()
    await this.values.add(node)
    await this.render()
  }

  async removeItem(value?: any) {
    if (!value) this.showEmptyItem = false
    else {
      const term = await value.term
      await this.engine.queryVoid(`
        delete { ?s ?p ?o }
        where {
          ?term (<http://a.com/a>|!<http://a.com/a>)* ?o . 
          ?s ?p ?o .
        }`, { 
        sources: [this.store],
        /** @ts-ignore */
        initialBindings: BF.fromRecord({ term }),
      })

      for (const fieldInstance of FieldInstances.values())
        fieldInstance.values = fieldInstance.valuesFetcher()
    }

    await this.render()
  }

  async item (value: LDflexPath) {
    return this.nodeShapeDefinition.shape['sh:property'].map(async predicatePath => {
      const predicate = await predicatePath['sh:path'].value

      return html`
        <frm-field
          .shape=${this.nodeShapeDefinition}
          .shapesubject=${this.nodeShape}
          .predicate=${predicate}
          .values=${async () => () => {
            if (value?.[predicate])
              return value?.[predicate]
            return this.values[this.predicate][predicate]
          }}
        />
      `
    })
  }

}