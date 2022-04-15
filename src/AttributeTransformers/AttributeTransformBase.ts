import { LDflexPath } from '../types/LDflexPath'

export abstract class AttributeTransformerBase {

  /**
   * Given certain data in the field (other values or certain languages)
   */
  abstract transform (data: LDflexPath, fieldDefinition: LDflexPath, query): Promise<{ [key: string]: string | null } | {}>

}