import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { WidgetsMatcherInterface } from './WidgetsMatcherInterface'
import { WidgetsScore, WidgetScore } from '../types/WidgetScores'
import { lastPart } from '../helpers/lastPart'

export class WidgetsMatcher implements WidgetsMatcherInterface {

  async match (settings: Settings, shape: LDflexPath) {
    // Ensure all the properties on the Widget classes are expanded.
    for (const widgetTypeClass of Object.values(settings.widgets))
      for (const arrayToExpand of ['supportedDataTypes', 'supportedProperties', 'requiredProperties'])
        widgetTypeClass[arrayToExpand] = widgetTypeClass[arrayToExpand].map(item => settings.context.expandTerm(item))

    // Make sure every shacl property has a frm:widget.
    for await (const predicatePath of shape['sh:property']) {
      if (!await predicatePath['frm:widget'].value) {
        const predicate = await predicatePath['sh:path'].value
        const widget = await this.scorePredicate(settings, predicate, predicatePath)

        // TODO the following breaks
        await predicatePath['frm:widget'].set(widget)
      }
    }
  }

  async scorePredicate (settings: Settings, predicate: string, predicatePath: LDflexPath) {
    const widgetsScore: WidgetsScore = {}

    for (const [widgetType, widgetTypeClass] of Object.entries(settings.widgets))
      widgetsScore[widgetType] = await this.scoreWidgetPredicate(settings, predicate, predicatePath, widgetTypeClass, widgetType)

    const sortedWidgets = Object.values(widgetsScore).sort((a, b) => b.total - a.total)
    const chosenWidget = sortedWidgets[0].total > 0 ? sortedWidgets[0].widget : 'unknown'

    return chosenWidget
  }

  async scoreWidgetPredicate (settings: Settings, predicate: string, predicatePath: LDflexPath, widgetTypeClass: any, widget: string): Promise<WidgetScore> {
    const properties: Array<string> = []
    for await (const propertyPath of predicatePath.properties)
      if (await predicatePath[propertyPath]) properties.push(settings.context.expandTerm(`${propertyPath}`)!)

    const datatypes: Array<string> = []
      for await (const propertyPath of predicatePath['sh:datatype'])
        datatypes.push(settings.context.expandTerm(propertyPath.value)!)
      
    const scoreWidgetPredicate = {
      commonName: widgetTypeClass.commonNamesCallback(lastPart(predicate), widgetTypeClass.commonNames),
      datatype: widgetTypeClass.supportedDataTypesCallback(datatypes, widgetTypeClass.supportedDataTypes),
      properties: widgetTypeClass.supportedPropertiesCallback(properties, widgetTypeClass.supportedProperties),
      required: widgetTypeClass.requiredPropertiesCallback(properties, widgetTypeClass.requiredProperties),
      widget: widget,
      total: 0
    }

    this.totalFormula(scoreWidgetPredicate)
    return scoreWidgetPredicate
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