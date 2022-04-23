import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { WidgetsMatcherInterface } from './WidgetsMatcherInterface'
import { WidgetsScore, WidgetScore } from '../types/WidgetScores'
import { lastPart } from '../helpers/lastPart'
import { ShapeDefinition } from './ShapeDefinition'

export class WidgetsMatcher implements WidgetsMatcherInterface {

  /**
   * This class matches a widget for every SHACL property.
   */
  async match (settings: Settings, shapeDefinition: ShapeDefinition) {
    // Make sure every shacl property has a frm:widget.
    for await (const shallowPredicatePath of shapeDefinition.shape['sh:property']) {
      const predicate = await shallowPredicatePath['sh:path'].value
      const predicatePath = shapeDefinition.getShaclProperty(predicate)

      if (!await predicatePath['frm:widget'].value) {
        const widgetName = await this.getWidgetName(settings, predicate, predicatePath)
        await predicatePath['frm:widget'].set(widgetName)
      }
    }
  }

  /**
   * Returns the best widget for a predicate.
   */
  async getWidgetName (settings: Settings, predicate: string, predicatePath: LDflexPath) {
    const widgetsScore: WidgetsScore = {}

    for (const [widgetType, widgetTypeClass] of Object.entries(settings.widgets))
      widgetsScore[widgetType] = await this.predicateWidgetScore(settings, predicate, predicatePath, widgetTypeClass, widgetType)

    const sortedWidgets = Object.values(widgetsScore).sort((a, b) => b.total - a.total)
    return sortedWidgets[0].total > 0 ? sortedWidgets[0].widget : 'unknown'
  }

  /**
   * Returns a scoring object for one widget for one predicate.
   */
  async predicateWidgetScore (settings: Settings, predicate: string, predicatePath: LDflexPath, widgetTypeClass: any, widget: string): Promise<WidgetScore> {
    const properties: Array<string> = []

    for await (const propertyPath of predicatePath.properties)
      properties.push(settings.context.expandTerm(`${propertyPath}`)!)

    const datatypes: Array<string> = []
      for await (const propertyPath of predicatePath['sh:datatype'])
        datatypes.push(settings.context.expandTerm(propertyPath.value)!)

    const predicateWidgetScore = {
      commonName: widgetTypeClass.commonNamesCallback(lastPart(predicate), widgetTypeClass.commonNames),
      datatype: widgetTypeClass.supportedDataTypesCallback(datatypes, widgetTypeClass.supportedDataTypes),
      properties: widgetTypeClass.supportedPropertiesCallback(properties, widgetTypeClass.supportedProperties),
      requiredProperties: widgetTypeClass.requiredPropertiesCallback(properties, widgetTypeClass.requiredProperties),
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
    const { commonName, datatype, properties, requiredProperties } = scoreWidgetPredicate
    if (requiredProperties < 0) scoreWidgetPredicate.total = -1
    else scoreWidgetPredicate.total = datatype + (commonName * 2) + properties + requiredProperties
  }
}