import { Settings } from '../types/Settings'
import { QueryEngine } from '@comunica/query-sparql'
import { ProxyHandlerStatic } from '@comunica/actor-http-proxy'
import { fetched } from '../helpers/fetched'
import basePrefixes from '../helpers/basePrefixes'

const comunica = new QueryEngine()

export class ReferenceResolver {
 
  #settings: Settings

  init (settings: Settings) {
    this.#settings = settings
  }
 
  async resolve (uri: string) {
    let label, image

    try {
      const query = `
        ${this.prefixes}

        SELECT ?label ?image {
          ?uri schema:name | foaf:name | rdfs:label ?label .
          OPTIONAL {
            ?uri foaf:img | dbo:thumbnail ?image .
          }
        }
      `

      const bindingsStream = await comunica.queryBindings(query, {
        httpProxyHandler: this.#settings.proxy ? new ProxyHandlerStatic(this.#settings.proxy) : undefined,
        sources: [uri],
        fetch: fetched
      })

      const bindings = await bindingsStream.toArray()
      label = bindings[0]?.get('label')?.value
      image = bindings[0]?.get('image')?.value
    }
    catch (exception) {

    }

    return {
      label, image, uri
    }
  }

  get prefixes () {
    return Object.entries(basePrefixes).map(([alias, prefix]) => `PREFIX ${alias}: <${prefix}>`).join('\n')
  }

  async search (source: string, query: string, searchTerm: string) {
    if (searchTerm !== undefined && !searchTerm) return []
    const langCode = this.#settings.internationalization.current
    query = query.replaceAll('SEARCH_TERM', searchTerm)
    query = query.replaceAll('LANGUAGE', langCode ? langCode : 'en')
    query = this.prefixes + '\n' + query

    const bindingsStream = await comunica.queryBindings(query, {
      httpProxyHandler: this.#settings.proxy ? new ProxyHandlerStatic(this.#settings.proxy) : undefined,
      sources: [source],
      fetch: fetched
    })

    const bindings = await bindingsStream.toArray()

    return bindings.map(binding => ({
      uri: binding.get('uri')?.value,
      label: binding.get('label')?.value,
      image: binding.get('image')?.value,
    }))
  }

}