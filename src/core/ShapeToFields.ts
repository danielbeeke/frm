import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html, render } from '../helpers/uhtml'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'

export const ShapeToFields = async (
  settings: Settings, 
  shapeDefinition: ShapeDefinition, 
  shapeSubject: string, 
  values: LDflexPath, 
  value: LDflexPath = null,
  store: Store,
  engine: ComunicaEngine
) => {
  const renderObject = {}
  
  for await (const predicatePath of shapeDefinition.shape['sh:property']) {
    const predicate = await predicatePath['sh:path'].value
    const element = document.createElement('div')

    await render(element, html`
      <frm-field
        .shape=${shapeDefinition}
        .shapesubject=${shapeSubject}
        .predicate=${predicate}
        .store=${store}
        .engine=${engine}
        .values=${async () => () => {
          if (value?.[predicate]) return value?.[predicate]
          return values?.[predicate] ? values[predicate] : values
        }}
      />
    `)

    renderObject[predicate] = element.children[0]
  }

  for (const [grouperName, grouper] of Object.entries(settings.groupers)) {
    for (const predicateGroup of grouper.applicablePredicateGroups) {
      if (predicateGroup.every(predicate => predicate in renderObject)) {
        const predicateElements: { [key: string]: any } = {}
        for (const predicate of predicateGroup) {
          predicateElements[predicate] = renderObject[predicate]
          delete renderObject[predicate]
        }

        renderObject[grouperName] = await (await new grouper(settings, predicateElements)).template()
      }
    }
  }

  return html`${Object.values(renderObject).filter(Boolean)}`
}