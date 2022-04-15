import { WidgetsMatcherInterface } from '../core/WidgetsMatcherInterface'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { DefinitionEnhancer } from '../core/DefinitionEnhancer'
import { Translator } from '../core/Translator'

export type Settings = {
  context: JsonLdContextNormalized,
  widgets: { [key: string]: any },
  attributeTransformers: { [key: string]: any },
  widgetsMatcher: WidgetsMatcherInterface,
  definitionEnhancer: DefinitionEnhancer,
  proxy: string,
  translator: Translator,
  keys?: {
    [product: string]: string
  }
}