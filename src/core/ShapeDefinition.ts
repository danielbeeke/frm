import { LDflexPath } from '../types/LDflexPath'
import SHACLValidator from 'rdf-validate-shacl'
import { NamedNode } from 'n3'
import ShaclShaclShape from '../shapes/shacl.shacl.ttl'
import { PathFactory } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { ContextParser } from 'jsonld-context-parser'
import { textToStore } from '../helpers/textToStore'

export class ShapeDefinition {

  private loading: Promise<any>
  private shape: LDflexPath
  private context: any

  constructor (turtleShaclShape: string, subjectUri: string) {
    this.loading = this.init(turtleShaclShape, subjectUri);
  }

  async init (turtleShaclShape: string, subjectUri: string) {
    const { store: shapes } = await textToStore(ShaclShaclShape)
    const { store: data, prefixes } = await textToStore(turtleShaclShape)
    const validator = new SHACLValidator(shapes)
    const report = await validator.validate(data)
    if (!await report.conforms) throw new Error('Given SHACL does not validate.')
    const queryEngine = new ComunicaEngine([data])
    const context = { '@context': prefixes }
    const contextParser = new ContextParser();
    this.context = await contextParser.parse(context)
    const path = new PathFactory({ context, queryEngine })
    const expandedSubject = await this.context.expandTerm(subjectUri)
    const subject = new NamedNode(expandedSubject)
    this.shape = path.create({ subject })
  }

  async get (predicate: string) {
    await this.loading
    const expandedPredicate = this.context.expandTerm(predicate)
    const shaclProperties = this.shape['sh:property']

    for await (const shaclProperty of shaclProperties) {
      if (await shaclProperty['sh:path'].value === expandedPredicate)
        return shaclProperty
    }
  }
}
