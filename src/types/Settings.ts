import { WidgetsMatcherInterface } from '../core/WidgetsMatcherInterface'
import { JsonLdContextNormalized } from 'jsonld-context-parser'

export type Settings = {
  context: JsonLdContextNormalized,
  widgets: { [key: string]: any },
  attributeTransformers: { [key: string]: any },
  widgetsMatcher: WidgetsMatcherInterface
}