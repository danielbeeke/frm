import SHACLValidator from 'rdf-validate-shacl'
import ShaclShaclShape from '../shapes/shacl.shacl.ttl'
import { rdfToStore } from './rdfToStore'
import { Store } from 'n3'

let shaclStore: Store

const validationCache = new Map()

export const validateShaclString = async (turtleShaclShape: string, ) => {
  if (!validationCache.has(turtleShaclShape)) {
    if (!shaclStore) {
      const { store } = await rdfToStore(ShaclShaclShape)
      shaclStore = store
    }
    const validator = new SHACLValidator(shaclStore)
    const { store: data } = await rdfToStore(turtleShaclShape)
    const report = validator.validate(data)
    validationCache.set(turtleShaclShape, report)      
  }

  const report = validationCache.get(turtleShaclShape)
  if (!report.conforms)
    throw new Error('Given SHACL does not validate. There is an error in the following: \n\n' + turtleShaclShape)

}