import { html } from '../helpers/uhtml'
import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'
import { LDflexPath } from '../types/LDflexPath'

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
    const node = this.settings.dataFactory.blankNode()
    await this.values.add(node)
    await this.render()
  }

  async items () {
    const callback = (async (value: LDflexPath | null = null) => {

      return html`
        <div class="item">
          ${await this.nodeShapeDefinition.shape['sh:property'].map(async predicatePath => {
            const predicate = await predicatePath['sh:path'].value

            return html`
              <frm-field
                .shape=${this.nodeShapeDefinition}
                .shapesubject=${this.nodeShape}
                .predicate=${predicate}
                .values=${() => value[predicate]}
              />
            `
          })}
          ${this.removeButton(value)}
        </div>
      `
    })

    return html`
      <div class="items">
        ${this.values.map(callback)}
      </div>
    `
  }

}