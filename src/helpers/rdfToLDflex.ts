import { rdfToStore } from './rdfToStore'
import ComunicaEngine from '@ldflex/comunica'
import { NamedNode } from 'n3'
import basePrefixes from './basePrefixes'
import { PathFactory, defaultHandlers } from 'ldflex'
import defaultIterationHandlers from '@ldflex/async-iteration-handlers'

export const rdfToLDflex = async (turtleShaclText, subjectUri: string) => {
  const { store, prefixes } = await rdfToStore(turtleShaclText)

  const queryEngine = new ComunicaEngine([store])
  const context = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
  const path = new PathFactory({ context, queryEngine, handlers: {
    ...defaultHandlers,
    ...defaultIterationHandlers
  } })
  const subject = new NamedNode(subjectUri)
  return path.create({ subject })
}