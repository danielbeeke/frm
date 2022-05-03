import { getLanguageLabels } from "../helpers/getLanguageLabels"

export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string
  public languageLabels: { [key: string]: { [key: string]: string } }
  public mode: 'tabs' | 'mixed' = 'mixed'
  public allowCreation: boolean = true

  constructor ({ langCodes, mode, allowCreation }: { 
    langCodes: Array<string>, 
    mode: 'tabs' | 'mixed',
    allowCreation: boolean
  }) {
    super()
    this.langCodes = langCodes
    this.#current = langCodes[0]
    this.allowCreation = allowCreation
    this.mode = mode
  }

  async init () {
    this.languageLabels = await getLanguageLabels(this.langCodes)
  }

  get current () {
    return this.#current
  }

  set current (newValue) {
    this.#current = newValue
    this.dispatchEvent(new CustomEvent('language-changed'))
  }

}
