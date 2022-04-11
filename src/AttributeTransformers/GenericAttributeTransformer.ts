import { AttributeTransformerBase } from './AttributeTransformBase'
import { LDflexPath } from '../types/LDflexPath'
import { lastPart } from '../helpers/lastPart'

export class GenericAttributeTransformer extends AttributeTransformerBase {

  private predicate: string

  constructor (predicate: string) {
    super()
    this.predicate = predicate
  }

  /**
   * A generic solution to display predicates.
   */
  async transform (data: LDflexPath, fieldDefinition: LDflexPath) {
    const value = await fieldDefinition[this.predicate].value
    return value ? `${lastPart(this.predicate)}="${value}"` : ''
  } 

}
