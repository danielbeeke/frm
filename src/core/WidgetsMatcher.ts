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

    let fields = await shapeDefinition.getPredicatesWithProperties()

    // Make sure every shacl property has a frm:widget.
    for (const [predicate, properties] of Object.entries(fields)) {
      if (!properties['frm:widget']) {
        const widgetName = this.getWidgetName(settings, predicate, properties)

        properties['frm:widget'] = [new Literal(widgetName)]
      }
    }
  }

  /**
   * Returns the best widget for a predicate.
   */
  getWidgetName (settings: Settings, predicate: string, predicateProperties) {
    const widgetsScore: WidgetsScore = {}

    for (const [widgetType, widgetTypeClass] of Object.entries(settings.widgets))
      widgetsScore[widgetType] = this.predicateWidgetScore(predicate, widgetTypeClass, widgetType, predicateProperties)

    const sortedWidgets = Object.values(widgetsScore).sort((a, b) => b.total - a.total)
    return sortedWidgets[0].total > 0 ? sortedWidgets[0].widget : 'unknown'
  }

  /**
   * Returns a scoring object for one widget for one predicate.
   */
  predicateWidgetScore (predicate: string, widgetTypeClass: any, widget: string, predicateProperties): WidgetScore {
    const properties = Object.keys(predicateProperties)
    const datatypes: Array<string> = predicateProperties['sh:datatype'] ?? []

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