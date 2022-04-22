import { Settings } from './types/Settings'
import { DataFactory } from 'n3'

import { JsonLdContextNormalized } from 'jsonld-context-parser'
import basePrefixes from './helpers/basePrefixes'

// Core
import { WidgetsMatcher } from './core/WidgetsMatcher'
import blacklistedProperties from './core/blacklistedProperties'
import { DefinitionEnhancer } from './core/DefinitionEnhancer'

// Translations
import english from './translations/english'
import { Translator } from './core/Translator'

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
import { NodeWidget } from './Widgets/NodeWidget'

export default {
  context: new JsonLdContextNormalized({
    '@language': 'en',
    ...basePrefixes
  }),
  proxy: 'http://localhost:1234/cors/',
  definitionEnhancer: new DefinitionEnhancer(),
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
    'date': DateWidget,
    'node': NodeWidget
  },
  dataFactory: DataFactory,
  keys: {},
  translator: new Translator({
    'en-US': english
  })
} as Settings