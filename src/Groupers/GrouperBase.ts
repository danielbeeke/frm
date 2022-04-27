import { html, Hole, render } from '../helpers/uhtml'
import { Settings } from '../types/Settings'
import { WidgetHtmlElement } from '../types/WidgetHtmlElement'
import { lastPart } from '../helpers/lastPart'

export abstract class GrouperBase {
  
  public templates: { [key: string]: Hole } = {}
  public values: { [key: string]: WidgetHtmlElement } = {}
  static aliasses = {}
  public settings: Settings
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>
  public render: () => Promise<void>

  public static applicablePredicateGroups: Array<Array<string>>

  constructor (settings: Settings, templates: { [key: string]: Hole }, values: { [key: string]: WidgetHtmlElement }, renderCallback) {
    this.settings = settings
    this.t = settings.translator.t.bind(settings.translator)
    this.render = renderCallback

    const promise = Object.values(templates).map(async template => {
      const temporaryElement = document.createElement('div')
      await render(temporaryElement, template)
      if (!temporaryElement.children[0]['widget']) {
        await (temporaryElement.children[0] as WidgetHtmlElement).connectedCallback()
      }
    })

    /** @ts-ignore */
    const aliasses = this.constructor.aliasses

    for (const [expandedPredicate, htmlElement] of Object.entries(templates)) {
      const compactedPredicate = settings.context.compactIri(expandedPredicate)
      let name = lastPart(compactedPredicate)
      if (aliasses[name]) name = aliasses[name]
      this.templates[name] = htmlElement
      this.values = values
    }

    /** @ts-ignore */
    return Promise.all(promise).then(() => this)
  }

  async template () {
    return html`Please implement`
  }

}