import { WidgetBase } from '../Widgets/WidgetBase'

export type WidgetHtmlElement = HTMLElement & { 
  connectedCallback: any,
  widget: WidgetBase
  setValue: (value: string) => Promise<void>
}