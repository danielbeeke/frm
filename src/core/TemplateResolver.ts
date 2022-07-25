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

    if (!variant && typeof args[0] === 'string')
      variant = args[0]

    const output = this.#templates[`${templateName}-${variant}`] ? 
    this.#templates[`${templateName}-${variant}`](...args) :
    this.#templates[templateName](...args)

    // console.log(templateName, args)

    return output
  }
}