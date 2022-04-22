import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html, render } from '../helpers/uhtml'

export const ShapeToFields = async (settings: Settings, shapeDefinition: ShapeDefinition, shapeSubject: string, values: LDflexPath, value: LDflexPath = null) => {
  const renderObject = {}
  
  for await (const predicatePath of shapeDefinition.shape['sh:property']) {
    const predicate = await predicatePath['sh:path'].value
    const element = document.createElement('div')

    await render(element, html`
      <frm-field
        .shape=${shapeDefinition}
        .shapesubject=${shapeSubject}
        .predicate=${predicate}
        .values=${async () => () => {
          if (value?.[predicate]) return value?.[predicate]
          return values?.[predicate] ? values[predicate] : values
        }}
      />
    `)

    renderObject[predicate] = element.children[0]
  }

  console.log(renderObject)

  return html`${Object.values(renderObject).filter(Boolean)}`
}