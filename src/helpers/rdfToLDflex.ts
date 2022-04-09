import { rdfToStore } from './rdfToStore'
import ComunicaEngine from '@ldflex/comunica'
import { PathFactory } from 'ldflex'
import { NamedNode } from 'n3'

export const rdfToLDflex = async (turtleShaclText, subjectUri: string) => {
  const { store, prefixes } = await rdfToStore(turtleShaclText)
  const queryEngine = new ComunicaEngine([store])
  const context = { '@context': prefixes }
  const path = new PathFactory({ context, queryEngine })
  const subject = new NamedNode(subjectUri)
  return path.create({ subject })
}