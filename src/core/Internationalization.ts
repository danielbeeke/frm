export class Internationalization extends EventTarget {

  public langCodes: Array<string> = []
  #current: string
  public languageLabels: { [key: string]: { [key: string]: string } }

  constructor (langCodes: Array<string> = []) {
    super()
    this.langCodes = langCodes
    this.#current = langCodes[0]
  }

  async init () {
    this.languageLabels = await this.getLanguageLabels()
  }

  get current () {
    return this.#current
  }

  async getLanguageLabels () {
    const languageLabelsQuery = `
      SELECT ?code ?native_label ?label WHERE {
        ?s wdt:P218 ?code .
        OPTIONAL { ?s rdfs:label ?label . }
        FILTER (${this.langCodes.map(langCode => `?code = '${langCode}'`).join(' || ')})
        FILTER (${this.langCodes.map(langCode => `lang(?label) = '${langCode}'`).join(' || ')})
      }
      ORDER BY ?code
    `
    
    try {
      const response = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(languageLabelsQuery)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })

      const json = await response.json()
      const languageLabels = {}

      for (const binding of json.results.bindings) {
        if (!languageLabels[binding.label['xml:lang']]) languageLabels[binding.label['xml:lang']] = {}
        languageLabels[binding.label['xml:lang']][binding.code.value] = binding.label.value
      }

      return languageLabels
    }
    catch (exception) {
      console.log(exception)
      return {}
    }
  }
}
