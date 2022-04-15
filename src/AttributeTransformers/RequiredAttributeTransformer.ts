import { AttributeTransformerBase } from './AttributeTransformBase'
import { LDflexPath } from '../types/LDflexPath'

export class RequiredAttributeTransformer extends AttributeTransformerBase {

  /**
   * Determines if the required attribute should be shown.
   */
  async transform (data: LDflexPath, fieldDefinition: LDflexPath) {
    const minCount = await fieldDefinition['sh:minCount'].value ?? 0
    if (minCount === 0) return {}

    const predicate = await fieldDefinition['sh:path']?.value

    const items: Array<LDflexPath> = []
    for await (const item of data[predicate]) items.push(item.value)

    return items.length <= minCount ? { 'required': null } : {}
  } 

}
