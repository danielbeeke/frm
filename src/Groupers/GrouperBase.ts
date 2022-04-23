import { html } from '../helpers/uhtml'
import { Settings } from '../types/Settings'
import { WidgetHtmlElement } from '../types/WidgetHtmlElement'
import { lastPart } from '../helpers/lastPart'

export abstract class GrouperBase {
  
  public elements: { [key: string]: WidgetHtmlElement } = {}
  static aliasses = {}
  public settings: Settings

  constructor (settings: Settings, elements: { [key: string]: WidgetHtmlElement }) {
    this.settings = settings
    /** @ts-ignore */
    const aliasses = this.constructor.aliasses

    for (const [expandedPredicate, htmlElement] of Object.entries(elements)) {
      const compactedPredicate = settings.context.compactIri(expandedPredicate)
      let name = lastPart(compactedPredicate)
      if (aliasses[name]) name = aliasses[name]
      this.elements[name] = htmlElement
    }

    const connectedCallbacks = Promise.all(Object.values(this.elements).map(element => element.connectedCallback()))

    /** @ts-ignore */
    return connectedCallbacks.then(() => this)
  }

  async template () {
    return html`Please implement`
  }

}