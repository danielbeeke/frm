import { WidgetsMatcherInterface } from '../core/WidgetsMatcherInterface'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { DefinitionEnhancer } from '../core/DefinitionEnhancer'
import { Translator } from '../core/Translator'
import { DataFactory } from 'n3'
import { GeocoderBase } from '../Plugins/Geocoder/GeocoderBase'
import { Internationalization } from '../core/Internationalization'

export type Settings = {
  context: JsonLdContextNormalized,
  widgets: { [key: string]: any },
  groupers: { [key: string]: any },
  attributeTransformers: { [key: string]: any },
  widgetsMatcher: WidgetsMatcherInterface,
  definitionEnhancer: DefinitionEnhancer,
  proxy: string,
  translator: Translator,
  geocoder?: GeocoderBase,
  dataFactory: typeof DataFactory,
  elements: {
    [key: string]: (settings: Settings) => any
  }
  keys?: {
    [product: string]: string
  },
  internationalization: Internationalization
}