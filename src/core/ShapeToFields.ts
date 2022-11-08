import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { html } from '../helpers/uhtml'
import { Store } from 'n3'
import ComunicaEngine from '@ldflex/comunica'
import { stableSort } from '../helpers/stableSort'
import { RenderItem } from '../types/RenderItem'
import { asStatic, asParams, asTag } from 'static-params'

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

    const valueFetcher = () => {
      if (value?.[predicate]) return value?.[predicate]
      return values?.[predicate] ? values[predicate] : values
    }

    let fieldElement

    // We make a template creator because we need to be apply to fetch the element inside a grouper.
    const templateCreator = (ref = null) => html`<frm-field
      ref=${ref ? ref : (field) => {
        fieldElement = field
        field.widget?.render()
      }}
      .shape=${shapeDefinition}
      .shapesubject=${shapeSubject}
      .predicate=${predicate}
      .store=${store}
      .engine=${engine}
      .values=${async () => valueFetcher}
    />`

    return {
      template: templateCreator(),
      templateCreator,
      type: 'field',
      identifier: predicate,
      order: order !== undefined ? parseInt(order) : 1000,
      group,
      ready: new Promise((resolve) => {
        const interval = setInterval(() => {
          if (fieldElement && fieldElement) {
            resolve(fieldElement.isReady)
            clearInterval(interval)
          }
        }, 100)
      })
    }
  })
}

const getShapeGroups = async (shapeDefinition, parentUri = undefined) => {
  const groups = shapeDefinition.getShaclGroup('sh:PropertyGroup')

  const filteredGroups: Array<any> = []

  for await (const group of groups['^rdf:type']) {
    const parentGroup = await group['sh:group'].value
    if (parentGroup === parentUri) filteredGroups.push(group)
  }

  return filteredGroups
}

/**
 * Enables sh:group
 * 
 * Nested groups work
 * TODO How to get groups into the first level of a second shape?
 */
const getGroups = async (settings: Settings, shapeDefinition: ShapeDefinition, fields: Array<RenderItem>, parentIri: any = undefined, isRoot = false) => {
  if (parentIri === undefined && !isRoot) parentIri = false

  const parentlessGroups = await getShapeGroups(shapeDefinition, parentIri)

  const groups = await Promise.all(parentlessGroups.map(async group => {
    const groupIRI = await group.term.value
    const childGroups = await getGroups(settings, shapeDefinition, fields, groupIRI)

    const order = await group['sh:order'].value
    const extraCssClasses = await group['html:class'].map(item => item.value)
    const groupFields = fields.filter(renderItem => {
      if (renderItem.group === groupIRI) {
        renderItem.picked = true
        return true
      }
      return false
    })

    const sortedChildren = [
      ...childGroups, 
      ...groupFields
    ].sort((a, b) => a.order - b.order)

    return {
      template: settings.templates.apply(
        'group', {
          name: await group['rdfs:label'], 
          label: await group['rdfs:label'], 
          inner: sortedChildren.map(field => field.template), 
          extraCssClasses
        }
      ),
      ready: Promise.all(sortedChildren.map(item => item.ready)),
      type: 'group',
      identifier: groupIRI,
      order: order !== undefined ? parseInt(order) : 1000,
    }
  }))

  return groups
}

const getGroupers = async (settings: Settings, fields: Array<RenderItem>, values: LDflexPath) => {
  const grouperInstances: Array<RenderItem> = []

  for (const [grouperName, Grouper] of Object.entries(settings.groupers)) {
    for (const predicateGroup of Grouper.applicablePredicateGroups) {
      if (predicateGroup.every(predicate => fields.find(item => item.identifier === predicate))) {
        const templates = {}
        
        let firstOrder: number | null = null

        for (const predicate of predicateGroup) {
          const renderItem = fields.find(item => item.identifier === predicate)
          if (firstOrder === null) firstOrder = renderItem?.order ?? 1000
          if (renderItem?.template) {
            renderItem.picked = true
            const name = settings.context.compactIri(predicate)
            templates[name] = renderItem // THis includes the templateCreator from the field.
          }
        }

        grouperInstances.push({
          order: firstOrder!,
          template: html`<frm-grouper
            .grouper-type=${Grouper}
            ref=${(element) => {
              if (!element.grouper) return
              element.grouper.values = values
              element.grouper.templates = templates
              element.grouper.render()
            }}
            .values=${() => values}
            .templates=${templates}
          />`,
          ready: Promise.all(Object.values(templates).map((item: any) => item.ready)),
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
  store: Store
) => {
  const elements = shapeDefinition.shape['frm:element'].map(async predicatePath => {
    const order = await predicatePath['sh:order'].value
    const group = await predicatePath['sh:group'].value
    const elementName = await predicatePath['frm:widget'].value

    const name = asStatic(elementName)
    const params = asParams`<${name} ref=${(element) => {
      element.definition = predicatePath
      element.shapeDefinition = shapeDefinition
      element.store = store
      element.render()
    }}></${name}>`

    return {
      template: html(...params),
      type: 'field',
      identifier: elementName,
      order: order !== undefined ? parseInt(order) : 0,
      group,
      ready: Promise.resolve()
    }
  })

  return elements
}

export const ShapeToFields = async (
  settings: Settings, 
  shapeDefinition: ShapeDefinition, 
  shapeSubject: string, 
  values: LDflexPath, 
  value: LDflexPath = null,
  store: Store,
  engine: ComunicaEngine,
  isRoot: boolean = false
) => {
  const fields = await getFields(shapeDefinition, shapeSubject, values, value, store, engine)
  const elements = await getElements(shapeDefinition, store)
  const mergedItems = [...fields, ...elements]
  const groups = await getGroups(settings, shapeDefinition, mergedItems, undefined, isRoot)
  const groupers = await getGroupers(settings, fields, value ?? values)
  const unpickedItems = mergedItems.filter(field => !field.picked)
  const merged: Array<RenderItem> = [...unpickedItems, ...groups, ...groupers]  
  const sortedRenderItems = stableSort(merged, (a: RenderItem, b: RenderItem) => a.order - b.order)

  return {
    fields: sortedRenderItems.map(item => item.template),
    ready: Promise.all(sortedRenderItems.map((item: any) => item.ready)),
  }
}