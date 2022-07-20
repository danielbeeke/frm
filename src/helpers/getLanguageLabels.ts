import { fetched } from '../helpers/fetched'

export const getLanguageLabels = async (langCodes: Array<string>, UIlangCodes: Array<string>) => {
  if (!langCodes.length) return {}

  const languageLabelsQuery = `
    SELECT ?code ?native_label ?label WHERE {
      ?s wdt:P218 ?code .
      OPTIONAL { ?s rdfs:label ?label . }
      FILTER (${langCodes.map(langCode => `?code = '${langCode}'`).join(' || ')})
      FILTER (${UIlangCodes.map(langCode => `lang(?label) = '${langCode}'`).join(' || ')})
    }
    ORDER BY ?code
  `
  
  try {
    const response = await fetched(`https://query.wikidata.org/sparql?query=${encodeURIComponent(languageLabelsQuery)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    const json = await response.json()
    const languageLabels = {}

    for (const binding of json.results.bindings) {
      if (!languageLabels[binding.label['xml:lang']]) languageLabels[binding.label['xml:lang']] = {}
      languageLabels[binding.label['xml:lang']][binding.code.value] = binding.label.value
    }

    // Worst case scenario, fallback to langcode.
    for (const langCode of UIlangCodes) {
      if (!languageLabels[langCode]) languageLabels[langCode] = {}

      for (const innerLangCode of langCodes) {
        if (!languageLabels[langCode][innerLangCode]) languageLabels[langCode][innerLangCode] = innerLangCode
      }  
    }
    
    return languageLabels
  }
  catch (exception) {
    // When we fail it might be wikidata that is down so we resort to an ugly but working variant.
    console.log(exception)

    const returnObject = {}
    for (const langCode of langCodes) {
      returnObject[langCode] = {}

      for (const innerLangCode of langCodes) {
        returnObject[langCode][innerLangCode] = innerLangCode
      }  
    }

    return returnObject
  }
}