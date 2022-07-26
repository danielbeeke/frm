import { ShapeDefinition } from '../core/ShapeDefinition'
import { WidgetBase } from '../Widgets/WidgetBase'
import { LDflexPath } from './LDflexPath'

export type WidgetHtmlElement = HTMLElement & { 
  connectedCallback: any,
  widget: WidgetBase
  setValue: (value: string) => Promise<void>
  getValue: LDflexPath
  shape: ShapeDefinition
  nodeName: string
}