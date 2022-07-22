import { getLanguageLabels } from '../helpers/getLanguageLabels'
import { Settings } from '../types/Settings'

export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string | false
  public languageLabels: { [key: string]: { [key: string]: string } }
  public mode: 'tabs' | 'mixed' = 'mixed'
  public allowCreation: boolean = true
  public settings: Settings

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

  async init (settings: Settings) {
    this.settings = settings
    this.languageLabels = await getLanguageLabels(this.langCodes, ['en'])
  }

  get current () {
    return this.#current
  }

  set current (newValue: string | false) {
    this.#current = newValue
    this.dispatchEvent(new CustomEvent('language-changed'))
  }

  async addLanguage (langcode: string, label: string = '', langCodeOfLabel: string = '', formUri: string = '') {
    langcode = langcode.toLocaleLowerCase()
    this.langCodes.push(langcode)
    this.languageLabels = await getLanguageLabels(this.langCodes, ['en'])

    // Override if a label is given
    if (label && langCodeOfLabel) {
      this.languageLabels[langCodeOfLabel][langcode] = label

      console.log(formUri)
      // We save given language labels in the local storage.
    }
  }
}
