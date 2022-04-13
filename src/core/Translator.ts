import { FluentBundle, FluentResource } from '@fluent/bundle'
import { fluentResourceText } from '../types/fluentResourceText'

export class Translator extends EventTarget {

  private bundles: { [langCode: string]: FluentBundle } = {}
  private current: string

  constructor (languages: { [langCode: string]: fluentResourceText }, defaultLanguage: string | null = null) {
    super()

    for (const [langCode, resourceText] of Object.entries(languages)) {
      this.bundles[langCode] = new FluentBundle(langCode)
      const resource = new FluentResource(resourceText)
      let errors = this.bundles[langCode].addResource(resource)
      if (errors.length) console.error(errors)
    }

    if (!defaultLanguage) defaultLanguage = Object.keys(languages)[0]
    this.current = defaultLanguage
  }

  async t (key, tokens) {
    for (const [tokenName, tokenValue] of Object.entries(tokens)) {
      const resolved: any = await tokenValue
      tokens[tokenName] = resolved?.proxy ? resolved.toString() : resolved
    }

    let translatedStringFluent = this.bundles[this.current].getMessage(key)

    if (translatedStringFluent?.value) {
      return this.bundles[this.current].formatPattern(translatedStringFluent?.value, tokens)
    }
  }

}