import { WidgetsMatcherInterface } from '../core/WidgetsMatcherInterface'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { DefinitionEnhancer } from '../core/DefinitionEnhancer'
import { vanilla } from '../style/cssClasses'
import { Translator } from '../core/Translator'

export type Settings = {
  context: JsonLdContextNormalized,
  widgets: { [key: string]: any },
  attributeTransformers: { [key: string]: any },
  widgetsMatcher: WidgetsMatcherInterface,
  definitionEnhancer: DefinitionEnhancer,
  proxy: string,
  css: typeof vanilla,
  translator: Translator
}