import { html, Hole, render } from '../helpers/uhtml'
import { Settings } from '../types/Settings'
import { WidgetHtmlElement } from '../types/WidgetHtmlElement'
import { lastPart } from '../helpers/lastPart'

export abstract class GrouperBase {
  
  public values: { [key: string]: WidgetHtmlElement } = {}
  static aliasses = {}
  public settings: Settings
  public templates: Array<Hole> = []
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>
  public theme: (templateName: string, ...args: any[]) => Hole
  private host: HTMLElement

  public static applicablePredicateGroups: Array<Array<string>>

  constructor (settings: Settings, templates: { [key: string]: Hole }, host: HTMLElement) {
    this.settings = settings
    this.theme = settings.templates.apply.bind(settings.templates)
    this.t = settings.translator.t.bind(settings.translator)
    this.host = host

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
      this.templates[name] = template
    })

    /** @ts-ignore */
    return Promise.all(promise).then(() => this)
  }

  get name () {
    let name = ''
    for (const [grouperName, grouper] of Object.entries(this.settings.groupers)) {
      if (grouper === this.constructor) name = grouperName
    }

    return name
  }

  async render () {
    const template = await this.settings.templates.apply('grouper', this.name, this.template())
    return render(this.host, template)
  }

  async template () {
    return html`Please implement`
  }

}