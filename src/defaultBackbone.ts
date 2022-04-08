import { RequiredAttributeTransformer } from './attributeTransformers/RequiredAttributeTransformer'
import { WidgetsMatcher } from './core/WidgetsMatcher'

export default {
  widgets: {

  },
  attributeTransformers: {
    required: new RequiredAttributeTransformer()
  },
  widgetsMatcher: new WidgetsMatcher()
}