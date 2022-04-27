import { html, Hole } from '../helpers/uhtml'
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

    /** @ts-ignore */
    const aliasses = this.constructor.aliasses

    for (const [expandedPredicate, htmlElement] of Object.entries(templates)) {
      const compactedPredicate = settings.context.compactIri(expandedPredicate)
      let name = lastPart(compactedPredicate)
      if (aliasses[name]) name = aliasses[name]
      this.templates[name] = htmlElement
      this.values = values
    }
  }

  async template () {
    return html`Please implement`
  }

}