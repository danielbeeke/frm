import { html, Hole, render } from '../helpers/uhtml'
import { Settings } from '../types/Settings'
import { WidgetHtmlElement } from '../types/WidgetHtmlElement'
import { lastPart } from '../helpers/lastPart'

export abstract class GrouperBase {
  
  public values: { [key: string]: WidgetHtmlElement } = {}
  static aliasses = {}
  public settings: Settings
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>
  public render: () => Promise<void>

  public static applicablePredicateGroups: Array<Array<string>>

  constructor (settings: Settings, templates: { [key: string]: Hole }, renderCallback) {
    this.settings = settings
    this.t = settings.translator.t.bind(settings.translator)
    this.render = renderCallback

    /** @ts-ignore */
    const aliasses = this.constructor.aliasses

    const promise = Object.entries(templates).map(async ([expandedPredicate, template]) => {
      const compactedPredicate = settings.context.compactIri(expandedPredicate)
      let name = lastPart(compactedPredicate)
      if (aliasses[name]) name = aliasses[name]

      const temporaryElement = document.createElement('div')
      await render(temporaryElement, template)
      if (!temporaryElement.children[0]['widget']) {
        await (temporaryElement.children[0] as WidgetHtmlElement).connectedCallback()
      }

      this.values[name] = (temporaryElement.children[0] as WidgetHtmlElement)
    })

    /** @ts-ignore */
    return Promise.all(promise).then(() => this)
  }

  async template () {
    return html`Please implement`
  }

}