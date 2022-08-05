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
import { Internationalization } from './core/Internationalization'

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
import { EditorJsWidget } from './Widgets/EditorJsWidget'
import { TypeWidget } from './Widgets/TypeWidget'
import { ReferenceWidget } from './Widgets/ReferenceWidget'

import { Logger } from './core/Logger'

// Groupers
import { AddressGrouper } from './Groupers/AddressGrouper'

// Plugins
import { PositionstackGeocoder } from './Plugins/Geocoder/PositionstackGeocoder'

// Elements
import { FrmLanguageTabs } from './CustomElements/FrmLanguageTabs'

// Templates
import { TemplateResolver } from './core/TemplateResolver'
import templates from './templates/bootstrap/All'
import afterRender from './templates/bootstrap/afterRender'

// EditorJS
import Header from '@editorjs/header'; 
import List from '@editorjs/list'; 
import EditorjsColumns from './helpers/editorjs-columns';
import { BlockToolConstructable } from '@editorjs/editorjs'; 
import InlineImage from 'editorjs-inline-image'
import Link from '@editorjs/link'

const editorJsPlugins = {
  header: Header, 
  list: List,
  image: {
    class: InlineImage,
    config: {
      unsplash: false
    }
  },
  link: Link,
}

const rootEditorJsPlugins: any = Object.assign({}, editorJsPlugins)
rootEditorJsPlugins.columns = {
  class : EditorjsColumns as unknown as BlockToolConstructable,
  config : {
    tools : editorJsPlugins
  }
}

import { ReferenceResolver } from './core/ReferenceResolver'

export default {
  context: new JsonLdContextNormalized({
    '@language': 'en',
    ...basePrefixes
  }),

  // TODO inject translator some how.
  internationalization: new Internationalization({
    langCodes: ['en', 'nl'], 
    mode: 'mixed',
    allowCreation: true
  }),
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
    'node': NodeWidget,
    'editor': EditorJsWidget,
    'type': TypeWidget,
    'reference': ReferenceWidget
  },
  editorJs: {
      tools: rootEditorJsPlugins
  },
  // geocoder: new PositionstackGeocoder(YOUR_KEY)
  groupers: {
    'address': AddressGrouper
  },
  elements: {
    'frm-language-tabs': FrmLanguageTabs
  },
  logger: new Logger(),
  dataFactory: DataFactory,
  keys: {},
  translator: new Translator({
    'en': english
  }),
  referenceResolver: new ReferenceResolver(),
  afterRender: afterRender,
  templates: new TemplateResolver(templates)
} as Settings