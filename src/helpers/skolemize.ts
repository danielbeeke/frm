import { BlankNode } from 'n3'
import { SkolemizedBlankNode } from '../types/SkolemizedBlankNode'

export const skolemize = (term: BlankNode, prefix: string): SkolemizedBlankNode => {
  return Object.assign(term, {
    skolemized: {
      termType: 'NamedNode',
      value: prefix + ':' + term.value
    }
  })
}