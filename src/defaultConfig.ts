import { RequiredAttributeTransformer } from './AttributeTransformers/RequiredAttributeTransformer'
import { WidgetsMatcher } from './core/WidgetsMatcher'

export default {
  widgets: {

  },
  attributeTransformers: {
    required: new RequiredAttributeTransformer()
  },
  widgetsMatcher: new WidgetsMatcher()
}