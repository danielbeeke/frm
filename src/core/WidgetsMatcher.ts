import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { WidgetsMatcherInterface } from './WidgetsMatcherInterface'
import { WidgetsScore, WidgetScore } from '../types/WidgetScores'
import { lastPart } from '../helpers/lastPart'
import { ShapeDefinition } from './ShapeDefinition'
import { Literal } from 'n3'

export class WidgetsMatcher implements WidgetsMatcherInterface {

  /**
   * This class matches a widget for every SHACL property.
   */
  async match (settings: Settings, shapeDefinition: ShapeDefinition) {
    // Ensure all the properties on the Widget classes are expanded.
    for (const widgetTypeClass of Object.values(settings.widgets))
      for (const arrayToExpand of ['supportedDataTypes', 'supportedProperties', 'requiredProperties'])
        widgetTypeClass[arrayToExpand] = widgetTypeClass[arrayToExpand].map(item => settings.context.expandTerm(item))

    // Make sure every shacl property has a frm:widget.
    for await (const predicatePath of shapeDefinition.shape['sh:property']) {
      const predicate = predicatePath['sh:path'].value

      if (!predicatePath['frm:widget'].valueOf()) {
        const widgetName = await this.getWidgetName(settings, predicate, predicatePath)
        predicatePath['frm:widget'] = new Literal(widgetName)
      }
    }
  }

  /**
   * Returns the best widget for a predicate.
   */
  async getWidgetName (settings: Settings, predicate: string, predicatePath: LDflexPath) {
    const widgetsScore: WidgetsScore = {}

    for (const [widgetType, widgetTypeClass] of Object.entries(settings.widgets))
      widgetsScore[widgetType] = this.predicateWidgetScore(settings, predicate, predicatePath, widgetTypeClass, widgetType)

    const sortedWidgets = Object.values(widgetsScore).sort((a, b) => b.total - a.total)
    return sortedWidgets[0].total > 0 ? sortedWidgets[0].widget : 'unknown'
  }

  /**
   * Returns a scoring object for one widget for one predicate.
   */
  predicateWidgetScore (settings: Settings, predicate: string, predicatePath: LDflexPath, widgetTypeClass: any, widget: string): WidgetScore {
    const properties: Array<string> = []

    for (const propertyPath of Object.keys(predicatePath.properties))
      properties.push(settings.context.expandTerm(`${propertyPath}`)!)

    const datatypes: Array<string> = []
      for (const propertyPath of predicatePath['sh:datatype'])
        datatypes.push(settings.context.expandTerm(propertyPath.value)!)
      
    const predicateWidgetScore = {
      commonName: widgetTypeClass.commonNamesCallback(lastPart(predicate), widgetTypeClass.commonNames),
      datatype: widgetTypeClass.supportedDataTypesCallback(datatypes, widgetTypeClass.supportedDataTypes),
      properties: widgetTypeClass.supportedPropertiesCallback(properties, widgetTypeClass.supportedProperties),
      required: widgetTypeClass.requiredPropertiesCallback(properties, widgetTypeClass.requiredProperties),
      widget: widget,
      total: 0
    }

    this.totalFormula(predicateWidgetScore)
    return predicateWidgetScore
  }

  /**
   * Total formula.
   * If you want to edit the formula just extend WidgetsMatcher and put that class in the options.
   */
   totalFormula (scoreWidgetPredicate: WidgetScore) {
    const { commonName, datatype, properties, required } = scoreWidgetPredicate
    if (required < 0) scoreWidgetPredicate.total = -1
    else scoreWidgetPredicate.total = datatype + (commonName * 2) + properties + required
  }
}