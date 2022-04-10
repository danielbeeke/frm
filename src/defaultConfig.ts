// Core
import { WidgetsMatcher } from './core/WidgetsMatcher'
import blacklistedProperties from './core/blacklistedProperties'

// AtributeTransformers
import { RequiredAttributeTransformer } from './AttributeTransformers/RequiredAttributeTransformer'

// Widgets
import { StringWidget } from './Widgets/StringWidget'
import { PlainTextWidget } from './Widgets/PlainTextWidget'
import { GeoWidget } from './Widgets/GeoWidget'
import { DropdownWidget } from './Widgets/DropdownWidget'
import { DateWidget } from './Widgets/DateWidget'

export default {
  config: null,
  blacklistedProperties,
  widgetsMatcher: new WidgetsMatcher(),
  attributeTransformers: {
    required: new RequiredAttributeTransformer()
  },
  widgets: {
    'string': StringWidget,
    'plain-text': PlainTextWidget,
    'geo': GeoWidget,
    'dropdown': DropdownWidget,
    'date': DateWidget
  },
}