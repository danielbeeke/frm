import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html } from '../helpers/uhtml'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { GrouperBase } from '../Groupers/GrouperBase'
import { lastPart } from '../helpers/lastPart'
import { stableSort } from '../helpers/stableSort'

const grouperCache = new WeakMap()
const templateCache = new WeakMap()
const groupsCache = new WeakMap()

const groupTemplate = async (shapeDefinition: ShapeDefinition, groupIRI: string, templates) => {
  const definition = shapeDefinition.getShaclGroup(groupIRI)
  const extraCssClasses = await definition['html:class'].map(item => item.value)

  return html`<div class=${`group ${extraCssClasses?.join()}`}>
    <h3 class="group-label">${definition['rdfs:label']}</h3>
    ${templates}
  </div>`
}

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

  let grouperInstances: { [key: string]: GrouperBase } = grouperCache.get(value)
  let templates: any = templateCache.get(shapeDefinition)
  let groups: any = groupsCache.get(shapeDefinition)

  if (!grouperInstances) {
    const groupIRIs: Map<string, Array<string>> = new Map()
    groups = new Map()

    templates = await shapeDefinition.shape['sh:property|frm:element'].map(async predicatePath => {
      const element = await predicatePath['frm:widget'].value
      const predicate = await predicatePath['sh:path'].value
      const order = await predicatePath['sh:order'].value ? parseInt(await predicatePath['sh:order'].value) : 0

      const shGroupIRI = await predicatePath['sh:group'].value

      if (shGroupIRI) {
        let shGroup = groupIRIs.get(shGroupIRI)
        if (!shGroup) {
          shGroup = []
          groupIRIs.set(shGroupIRI, shGroup)
        }

        shGroup.push(predicate ?? element)
      }

      if (element && !predicate) {
        return [
          element,
          document.createElement('frm-' + element),
          'template',
          order
        ]
      }
      else {
        return [
          predicate, 
          html`<frm-field
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
          />`,
          'template',
          order
        ]
      }  
    })

    templates = templates.filter(Boolean)

    templateCache.set(shapeDefinition, templates)

    /**
     * Grouping by SHACL group
     */
    for (const [groupIRI, predicates] of groupIRIs.entries()) {
      const groupTemplates: Array<any> = []

      console.log(predicates)

      for (const [index, predicate] of predicates.entries()) {
        const templateTuple = templates.find(item => item[0] === predicate)
        if (templateTuple) {
          groupTemplates.push(templateTuple[1])
          templateTuple[2] = index === 0 ? 'group:' + groupIRI  + ':' + shapeSubject : 'skip'  
        }
      }

      groups.set(groupIRI + ':' + shapeSubject, groupTemplates)
    }

    groupsCache.set(shapeDefinition, groups)

    /**
     * Grouping by FRM Grouper
     */
    for (const [grouperName, Grouper] of Object.entries(settings.groupers)) {
      grouperInstances = {}

      for (const predicateGroup of Grouper.applicablePredicateGroups) {
        if (predicateGroup.every(predicate => templates.find(item => item[0] === predicate))) {

          const grouperElements = {}
          const grouperTemplates = {}
          
          let hadFirst = false
          for (const predicate of predicateGroup) {
            const templateTuple = templates.find(item => item[0] === predicate)
            templateTuple[2] = hadFirst ? 'skip' : 'grouper:' + grouperName
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
          
          grouperInstances[grouperName] = await new Grouper(settings, grouperTemplates, grouperElements, renderCallback)
        }
      }  

      grouperCache.set(shapeDefinition, value)
    }
  }

  console.table(templates)

  const sortedTemplates = stableSort(templates, (a, b) => a[3] - b[3])
  console.table(sortedTemplates)

  return html`
    ${sortedTemplates
      .map(([_predicate, template, action]) => {
        if (action === 'skip') return null
        if (action === 'template') return template
        if (action.startsWith('grouper:')) return grouperInstances[action.substring(8)].template()
        if (action.startsWith('group:')) {
          const groupIRI = action.substring(6).split(':' + shapeSubject)[0]
          return groupTemplate(shapeDefinition, groupIRI, groups.get(action.substring(6)))
        }
      })
      .filter(Boolean)
    }
  `
}