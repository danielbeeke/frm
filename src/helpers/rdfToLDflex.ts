import { rdfToStore } from './rdfToStore'
import ComunicaEngine from '@ldflex/comunica'
import { NamedNode, Writer } from 'n3'
import basePrefixes from './basePrefixes'
import { PathFactory, defaultHandlers } from 'ldflex'
import defaultIterationHandlers from '@ldflex/async-iteration-handlers'

export const rdfToLDflex = async (turtleShaclText, subjectUri: string, dumpStore: boolean = false) => {
  const { store, prefixes } = await rdfToStore(turtleShaclText)
  if (dumpStore) {
    console.log(store)
    console.log({
      serialize: async () => {
        const writer = new Writer({ prefixes: {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes}})
        store.forEach(quad => writer.addQuad(quad), null, null, null, null)
        writer.end((error, result) => console.log(result))
      }
    })
  }

  // const storeProxy = new Proxy(store, {
  //   get: function (target, propertyKey, receiver) {
  //     console.log(propertyKey)
  //     return Reflect.get(target, propertyKey, receiver)
  //   }
  // })
  
  const queryEngine = new ComunicaEngine([store])
  const context = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
  const path = new PathFactory({ context, queryEngine, handlers: {
    ...defaultHandlers,
    ...defaultIterationHandlers
  } })
  const subject = new NamedNode(subjectUri)
  return path.create({ subject })
}