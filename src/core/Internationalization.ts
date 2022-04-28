import { getLanguageLabels } from "../helpers/getLanguageLabels"

export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string
  public languageLabels: { [key: string]: { [key: string]: string } }
  public mode: 'tabs' | 'mixed'

  constructor (langCodes: Array<string> = [], mode: 'tabs' | 'mixed' = 'mixed') {
    super()
    this.langCodes = langCodes
    this.#current = langCodes[0]
    this.mode = mode
  }

  async init () {
    this.languageLabels = await getLanguageLabels(this.langCodes)
  }

  get current () {
    return this.#current
  }


}
