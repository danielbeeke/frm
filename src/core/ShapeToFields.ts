import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html, render } from '../helpers/uhtml'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { GrouperBase } from '../Groupers/GrouperBase'
import { lastPart } from '../helpers/lastPart'

const grouperCache = new WeakMap()
const templateCache = new WeakMap()

export const ShapeToFields = async (
  settings: Settings, 
  shapeDefinition: ShapeDefinition, 
  shapeSubject: string, 
  values: LDflexPath, 
  value: LDflexPath = null,
  store: Store,
  engine: ComunicaEngine,
  renderCallback: Function
) => {
  const fields = {}

  let groupers: { [key: string]: GrouperBase } = grouperCache.get(value)
  let templates: any = templateCache.get(shapeDefinition)

  if (!groupers) {
    templates = await shapeDefinition.shape['sh:property'].map(async predicatePath => {
      const predicate = await predicatePath['sh:path'].value
  
      return [predicate, html`
        <frm-field
          ref=${(element) => fields[predicate] = element}
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
      `, false]
    })

    templateCache.set(shapeDefinition, templates)

    for (const [grouperName, Grouper] of Object.entries(settings.groupers)) {
      groupers = {}

      for (const predicateGroup of Grouper.applicablePredicateGroups) {
        if (predicateGroup.every(predicate => templates.find(item => item[0] === predicate))) {

          const grouperElements = {}
          const grouperTemplates = {}
          
          let hadFirst = false
          for (const predicate of predicateGroup) {
            const templateTuple = templates.find(item => item[0] === predicate)
            templateTuple[2] = hadFirst ? true : grouperName
            grouperTemplates[predicate] = templateTuple[1]
            hadFirst = true

            const compactedPredicate = settings.context.compactIri(predicate)
            let name = lastPart(compactedPredicate)
            const aliasses = Grouper.aliasses

            if (aliasses[name]) name = aliasses[name]

            Object.defineProperty(grouperElements, name, {
              get () {
                return fields[predicate]
              }
            })
          }
          
          groupers[grouperName] = await new Grouper(settings, grouperTemplates, grouperElements, renderCallback)
        }
      }  

      grouperCache.set(shapeDefinition, value)
    }
  }

  return html`
    ${templates
      .map(([_predicate, template, skipOrGrouper]) => {
        if (!skipOrGrouper) return template
        if (skipOrGrouper !== true) return groupers[skipOrGrouper].template()
      })
      .filter(Boolean)
    }
  `
}