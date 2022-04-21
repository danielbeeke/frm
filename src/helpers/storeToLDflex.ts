import ComunicaEngine from '@ldflex/comunica'
import { NamedNode, Prefixes, Store } from 'n3'
import basePrefixes from './basePrefixes'
import { PathFactory, defaultHandlers } from 'ldflex'
import defaultIterationHandlers from '@ldflex/async-iteration-handlers'

export const storeToLDflex = async (store: Store, prefixes: Prefixes, subjectUri: string) => {
  const queryEngine = new ComunicaEngine([store])
  const context = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
  const path = new PathFactory({ context, queryEngine, handlers: {
    ...defaultHandlers,
    ...defaultIterationHandlers,
    term: (pathData) => pathData.subject
  } })
  const subject = new NamedNode(subjectUri)
  return path.create({ subject })
}