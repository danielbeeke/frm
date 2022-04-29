import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html } from '../helpers/uhtml'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { lastPart } from '../helpers/lastPart'
import { stableSort } from '../helpers/stableSort'
import { RenderItem } from '../types/RenderItem'

const getFields = async (
  shapeDefinition: ShapeDefinition, 
  shapeSubject: string, 
  values: LDflexPath, 
  value: LDflexPath = null,
  store: Store,
  engine: ComunicaEngine,
) => {
  return shapeDefinition.shape['sh:property'].map(async predicatePath => {
    const predicate = await predicatePath['sh:path'].value
    const order = await predicatePath['sh:order'].value
    const group = await predicatePath['sh:group'].value

    return {
      template: html`<frm-field
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
      type: 'field',
      identifier: predicate,
      order: order !== undefined ? parseInt(order) : 1000,
      group
    }
  })
}

const getGroups = async (shapeDefinition: ShapeDefinition, fields: Array<RenderItem>) => {
  const groupIRIs = new Set()

  const groups = await shapeDefinition.shape['sh:property|frm:element'].map(async predicatePath => {
    const groupIRI = await predicatePath['sh:group'].value

    if (groupIRI && !groupIRIs.has(groupIRI)) {
      groupIRIs.add(groupIRI)
      const definition = shapeDefinition.getShaclGroup(groupIRI)
      const order = await definition['sh:order'].value
      const extraCssClasses = await definition['html:class'].map(item => item.value)
      const groupFields = fields.filter(renderItem => {
        if (renderItem.group === groupIRI) {
          renderItem.picked = true
          return true
        }
      })

      return {
        template: html`<div class=${`group ${extraCssClasses?.join()}`}>
          <h3 class="group-label">${definition['rdfs:label']}</h3>
          ${groupFields.map(field => field.template)}
        </div>`,
        type: 'group',
        identifier: groupIRI,
        order: order !== undefined ? parseInt(order) : 1000,
      }
    }
  })

  return groups.filter(Boolean)
}

const getGroupers = async (settings: Settings, fields: Array<RenderItem>, renderCallback) => {
  const grouperInstances: Array<RenderItem> = []

  for (const [grouperName, Grouper] of Object.entries(settings.groupers)) {
    for (const predicateGroup of Grouper.applicablePredicateGroups) {
      if (predicateGroup.every(predicate => fields.find(item => item.identifier === predicate))) {
        const grouperTemplates = {}
        
        let firstOrder: number | null = null

        for (const predicate of predicateGroup) {
          const renderItem = fields.find(item => item.identifier === predicate)
          if (firstOrder === null) firstOrder = renderItem?.order ?? 1000
          if (renderItem?.template) {
            renderItem.picked = true
            grouperTemplates[predicate] = renderItem.template

            const compactedPredicate = settings.context.compactIri(predicate)
            let name = lastPart(compactedPredicate)
            const aliasses = Grouper.aliasses
  
            if (aliasses[name]) name = aliasses[name]

          }
        }
          
        const grouper = await new Grouper(settings, grouperTemplates, renderCallback)

        grouperInstances.push({
          grouper,
          order: firstOrder!,
          template: grouper.template(),
          type: 'grouper',
          identifier: grouperName
        })
      }
    }
  }  

  return grouperInstances
}

const getElements = async (
  shapeDefinition: ShapeDefinition, 
) => {
  return shapeDefinition.shape['frm:element'].map(async predicatePath => {
    const order = await predicatePath['sh:order'].value
    const group = await predicatePath['sh:group'].value
    const element = await predicatePath['frm:widget'].value

    return {
      template: document.createElement('frm-' + element),
      type: 'field',
      identifier: element,
      order: order !== undefined ? parseInt(order) : 0,
      group
    }
  })
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

  const fields = await getFields(shapeDefinition, shapeSubject, values, value, store, engine)
  const elements = await getElements(shapeDefinition)
  const mergedItems = [...fields, ...elements]
  const groups = await getGroups(shapeDefinition, mergedItems)
  const groupers = await getGroupers(settings, fields, renderCallback)
  const unpickedItems = mergedItems.filter(field => !field.picked)
  const merged: Array<RenderItem> = [...unpickedItems, ...groups, ...groupers]  
  const sortedRenderItems = stableSort(merged, (a: RenderItem, b: RenderItem) => a.order - b.order)

  return html`${sortedRenderItems.map(item => item.template)}`
}