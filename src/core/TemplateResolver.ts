import { html } from "../helpers/uhtml"

export class TemplateResolver<Templates> {
  #templates: Templates

  constructor (templates: Templates) {
    this.#templates = templates
  }

  label (templateName, variants) {
    return `${templateName} ${variants.map(variant => `${templateName}-${variant}`)}`
  }

  apply (templateName: string, ...args: Array<any>) {
    if (!this.#templates[templateName])
      console.log(this.#templates, templateName)

    let variant = typeof args[0]?.context === 'string' ? args[0]?.context : ''

    if (!variant && typeof args?.[0] === 'string')
      variant = args[0]

    const variants = [
      ...(!args?.[0]?.isProxy ? args?.[0]?.contexts ?? [] : []),
      `${templateName}-${variant}`,
      templateName,
    ]

    let output = null

    for (const variant of variants) {
      if (!output && this.#templates[variant]) output = this.#templates[variant](...args)
    }

    if (!output) output = html`Please implement ${templateName}`

    return output
  }
}