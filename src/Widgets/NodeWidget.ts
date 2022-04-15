import { html } from '../helpers/uhtml'
import { WidgetBase } from './WidgetBase'
import { ShapeDefinition } from '../core/ShapeDefinition'

export class NodeWidget extends WidgetBase {

  static supportedProperties = ['sh:node']

  public nodeShape: string
  public nodeShapeDefinition: ShapeDefinition
  public debug: boolean = false

  async init () {
    this.nodeShape = await this.definition['sh:node'].value
    const shapeText = this.host.closest('frm-form')!['shapeText']
    this.nodeShapeDefinition = await new ShapeDefinition(this.settings, shapeText, this.nodeShape)
  }

  async items() {
    const debug = this.host.closest('frm-form')?.hasAttribute('debug')

    return html`
    <div class="items">
      ${await this.nodeShapeDefinition.shape['sh:property'].map(async predicatePath => {
        const predicate = await predicatePath['sh:path'].value
        return html`
        <div class="item">
          <frm-field 
            .shape=${this.nodeShapeDefinition} 
            .shapesubject=${this.nodeShape} 
            .predicate=${predicate} 
            ?debug=${debug} 
            .value=${() => this.value[predicate]}
          />
        </div>`
      })}
    </div>
  `

  }
}