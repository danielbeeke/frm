import { getLanguageLabels } from "../helpers/getLanguageLabels"

export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string | false
  public languageLabels: { [key: string]: { [key: string]: string } }
  public mode: 'tabs' | 'mixed' = 'mixed'
  public allowCreation: boolean = true

  constructor ({ langCodes, mode, allowCreation }: { 
    langCodes?: Array<string>, 
    mode: 'tabs' | 'mixed',
    allowCreation: boolean
  }) {
    super()
    this.langCodes = langCodes ?? []
    this.#current = langCodes ? langCodes[0] : false
    this.allowCreation = allowCreation
    this.mode = mode
  }

  async init () {
    this.languageLabels = await getLanguageLabels(this.langCodes, ['en'])
  }

  get current () {
    return this.#current
  }

  set current (newValue: string | false) {
    this.#current = newValue
    this.dispatchEvent(new CustomEvent('language-changed'))
  }

  async addLanguage (langcode: string, label: string = '', langCodeOfLabel: string = '') {
    langcode = langcode.toLocaleLowerCase()
    this.langCodes.push(langcode)
    this.languageLabels = await getLanguageLabels(this.langCodes, ['en'])

    // Override if a label is given
    if (label && langCodeOfLabel)
      this.languageLabels[langCodeOfLabel][langcode] = label
  }
}
