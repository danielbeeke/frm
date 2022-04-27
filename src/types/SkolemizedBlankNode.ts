import { BlankNode } from 'n3'

export type SkolemizedBlankNode = BlankNode & {
  skolemized: {
    termType: string,
    value: string
  }
}