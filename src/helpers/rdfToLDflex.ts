import { rdfToStore } from './rdfToStore'
import ComunicaEngine from '@ldflex/comunica'
import { NamedNode } from 'n3'
import basePrefixes from './basePrefixes'
import { PathFactory } from 'ldflex'
import handlers from './ldFlexSettings'

export const rdfToLDflex = async (turtleShaclText, subjectUri: string) => {
  const { store, prefixes } = await rdfToStore(turtleShaclText)
  const queryEngine = new ComunicaEngine([store])
  const context = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes}}
  const path = new PathFactory({ context, queryEngine, handlers })
  const subject = new NamedNode(subjectUri)

  return {
    path: path.create({ subject }),
    store,
    engine: queryEngine
  }
}