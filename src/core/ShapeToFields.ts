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
  validationReport: any
) => {
  return shapeDefinition.shape['sh:property'].map(async predicatePath => {
    const predicate = await predicatePath['sh:path'].value
    const order = await predicatePath['sh:order'].value
    const group = await predicatePath['sh:group'].value
    const fieldErrors = validationReport?.results.filter(error => error.path.value === predicate) ?? []

    return {
      template: html`<frm-field
        .shape=${shapeDefinition}
        .shapesubject=${shapeSubject}
        .predicate=${predicate}
        .store=${store}
        .errors=${fieldErrors}
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

/**
 * Enables sh:group
 * 
 * TODO check if nested groups work and if te order of the turtle text makes a difference.
 */
const getGroups = async (settings: Settings, shapeDefinition: ShapeDefinition, fields: Array<RenderItem>) => {
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
        template: settings.templates.apply('group', await definition['rdfs:label'], await definition['rdfs:label'], groupFields.map(field => field.template), extraCssClasses),
        type: 'group',
        identifier: groupIRI,
        order: order !== undefined ? parseInt(order) : 1000,
      }
    }
  })

  return groups.filter(Boolean)
}

const getGroupers = async (settings: Settings, fields: Array<RenderItem>, renderCallback, value: LDflexPath) => {
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
          
        // TODO Grouper should have cache so it can remember state.
        // let grouper = grouperCache.get(value)
        // if (!grouper) {
          let grouper = await new Grouper(settings, grouperTemplates, renderCallback)
        //   grouperCache.set(Grouper, grouper)
        // }

        grouperInstances.push({
          grouper,
          order: firstOrder!,
          template: settings.templates.apply('grouper', grouperName, grouper.template()),
          type: 'grouper',
          identifier: grouperName
        })
      }
    }
  }  

  return grouperInstances
}

const elementCache = new WeakMap()
const getElements = async (
  shapeDefinition: ShapeDefinition, 
) => {
  if (!elementCache.has(shapeDefinition)) {
    const elements = shapeDefinition.shape['frm:element'].map(async predicatePath => {
      const order = await predicatePath['sh:order'].value
      const group = await predicatePath['sh:group'].value
      const elementName = await predicatePath['frm:widget'].value
      const element = document.createElement(elementName)
  
      element.definition = predicatePath
  
      return {
        template: element,
        type: 'field',
        identifier: elementName,
        order: order !== undefined ? parseInt(order) : 0,
        group
      }
    })

    elementCache.set(shapeDefinition, elements)
  }

  return elementCache.get(shapeDefinition)
}

export const ShapeToFields = async (
  settings: Settings, 
  shapeDefinition: ShapeDefinition, 
  shapeSubject: string, 
  values: LDflexPath, 
  value: LDflexPath = null,
  store: Store,
  engine: ComunicaEngine,
  renderCallback: Function,
  validationReport: any
) => {

  const fields = await getFields(shapeDefinition, shapeSubject, values, value, store, engine, validationReport)
  const elements = await getElements(shapeDefinition)
  const mergedItems = [...fields, ...elements]
  const groups = await getGroups(settings, shapeDefinition, mergedItems)
  const groupers = await getGroupers(settings, fields, renderCallback, value)
  const unpickedItems = mergedItems.filter(field => !field.picked)
  const merged: Array<RenderItem> = [...unpickedItems, ...groups, ...groupers]  
  const sortedRenderItems = stableSort(merged, (a: RenderItem, b: RenderItem) => a.order - b.order)

  return html`${sortedRenderItems.map(item => item.template)}`
}