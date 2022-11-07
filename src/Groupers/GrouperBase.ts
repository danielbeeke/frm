import { html, Hole, render } from '../helpers/uhtml'
import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'
import { FrmGrouper } from '../CustomElements/FrmGrouper'
import { FrmField } from '../CustomElements/FrmField'

export abstract class GrouperBase {

  public settings: Settings
  public templates: { [key: string]: any }
  public values: LDflexPath
  public t: (key: string, tokens?: {[key: string]: any}) => Promise<string | undefined>
  public theme: (templateName: string, ...args: any[]) => Hole
  public host: FrmGrouper
  public fields: { [key: string]: FrmField }

  public static applicablePredicateGroups: Array<Array<string>>

  constructor (settings: Settings, host: FrmGrouper) {
    this.settings = settings
    this.theme = settings.templates.apply.bind(settings.templates)
    this.t = settings.translator.t.bind(settings.translator)
    this.host = host
    this.values = host.values()
    this.templates = host.templates

    this.fields = {}
  }

  get name () {
    for (const [grouperName, grouper] of Object.entries(this.settings.groupers)) {
      if (grouper === this.constructor) return grouperName
    }
    return ''
  }

  async render () {
    const rawTemplate = await this.template()
    const template = await this.settings.templates.apply('grouper', {
      context: this.name, 
      inner: rawTemplate
    })
    await render(this.host, template)

    if (Object.keys(this.fields).length === 0) {
      const wrapper = document.createElement('div')
      render(wrapper, html`${this.fieldTemplates()}`)
    }
  }

  async template () {
    return html`Please implement`
  }

  fieldTemplates () {
    return Object.entries(this.templates).map(([name, item]) => item.templateCreator(async (element) => {
      this.fields[name] = element
      setTimeout(() => {
        if (!element.widget) element.connectedCallback()
      }, 100)
    }))
  }

}