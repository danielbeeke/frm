import { html } from '../helpers/uhtml'
import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'
import { DataFactory } from 'n3'

export class NodeWidget extends WidgetBase {

  static supportedProperties = ['sh:node']

  public nodeShape: string
  public predicate: string
  public nodeShapeDefinition: ShapeDefinition
  public debug: boolean = false

  async init () {
    this.nodeShape = await this.definition['sh:node'].value
    this.predicate = await this.definition['sh:path'].value
    const shapeText = this.host.closest('frm-form')!['shapeText']
    this.nodeShapeDefinition = await new ShapeDefinition(this.settings, shapeText, this.nodeShape)
  }

  async addItem(): Promise<void> {
    await this.values.add(DataFactory.blankNode())
    await this.render()
  }

  async items () {
    const callback = (async (value: LDflexPath | null = null) => {

      return html`
        ${await this.nodeShapeDefinition.shape['sh:property'].map(async predicatePath => {
          const predicate = await predicatePath['sh:path'].value
          return html`
          <div class="item">
            <frm-field
              .shape=${this.nodeShapeDefinition}
              .shapesubject=${this.nodeShape}
              .predicate=${predicate}
              .values=${() => value[predicate]}
            />

            ${this.removeButton(value[predicate])}
          </div>`
        })}
      `
    })

    // uhtml does not understand what to cache here, so we break the cache on purpose.
    return html.for({})`
      <div class="items">
        ${this.values.map(callback)}
      </div>
    `
  }

}