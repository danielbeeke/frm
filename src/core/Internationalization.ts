import { getLanguageLabels } from '../helpers/getLanguageLabels'
import { Settings } from '../types/Settings'

export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string | false
  public languageLabels: { [key: string]: { [key: string]: string } }
  public allowCreation: boolean = true
  public settings: Settings

  constructor ({ langCodes, allowCreation }: { 
    langCodes?: Array<string>, 
    allowCreation: boolean
  }) {
    super()
    this.langCodes = langCodes ?? ['en']
    this.#current = this.langCodes[0]
    this.allowCreation = allowCreation
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
      // We save given language labels in the local storage.
    }
  }
}
