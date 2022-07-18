import { Hole, html } from "../helpers/uhtml";

const debug = localStorage.debug

export class TemplateResolver {
  #templates: { [key: string]: (...args: Array<any>) => Hole }

  constructor (templates: { [key: string]: (...args: Array<any> | any) => Hole }) {
    this.#templates = templates
  }

  label (templateName, variants) {
    return `${templateName} ${variants.map(variant => `${templateName}-${variant}`)}`
  }

  apply (templateName: string, ...args: Array<any>) {
    if (!this.#templates[templateName])
      console.log(this.#templates, templateName)

    let variant = typeof args[0]?.context === 'string' ? args[0]?.context : ''

    if (!variant && typeof args[0] === 'string')
      variant = args[0]

    const label = this.label(templateName, variant ? [variant] : [])

    const output = this.#templates[`${templateName}-${variant}`] ? 
    this.#templates[`${templateName}-${variant}`](...args) :
    this.#templates[templateName](...args)

    return debug ? html`
      ${output}
      ${new Hole('html', [`<!-- END ${label} -->`], [])}
    ` : output
  }
}