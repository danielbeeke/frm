import { AttributeTransformerInterface } from './AttributeTransformInterface'
import { LDflexPath } from '../types'
import { Store } from 'n3'

export class RequiredAttributeTransformer implements AttributeTransformerInterface {

  /**
   * Given certain data in the field (other values or certain languages)
   */
   transform (dataStore: Store, fieldDefinition: LDflexPath) {
    return ''
   } 

}