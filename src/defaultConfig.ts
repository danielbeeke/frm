import { JsonLdContextNormalized } from 'jsonld-context-parser'

// Core
import { WidgetsMatcher } from './core/WidgetsMatcher'
import blacklistedProperties from './core/blacklistedProperties'

// AtributeTransformers
import { RequiredAttributeTransformer } from './AttributeTransformers/RequiredAttributeTransformer'
import { GenericAttributeTransformer } from './AttributeTransformers/GenericAttributeTransformer'

// Widgets
import { UnknownWidget } from './Widgets/UnknownWidget'
import { StringWidget } from './Widgets/StringWidget'
import { PlainTextWidget } from './Widgets/PlainTextWidget'
import { GeoWidget } from './Widgets/GeoWidget'
import { DropdownWidget } from './Widgets/DropdownWidget'
import { DateWidget } from './Widgets/DateWidget'

export default {
  context: new JsonLdContextNormalized({}),
  blacklistedProperties,
  widgetsMatcher: new WidgetsMatcher(),
  attributeTransformers: {
    required: new RequiredAttributeTransformer(),
    rows: new GenericAttributeTransformer('html:rows'),
    minLength: new GenericAttributeTransformer('sh:minLength')
  },
  widgets: {
    'unknown': UnknownWidget,
    'string': StringWidget,
    'plain-text': PlainTextWidget,
    'geo': GeoWidget,
    'dropdown': DropdownWidget,
    'date': DateWidget
  },
}