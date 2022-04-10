import { LDflexPath } from '../types/LDflexPath'
import SHACLValidator from 'rdf-validate-shacl'
import { NamedNode, Prefixes, Store } from 'n3'
import ShaclShaclShape from '../shapes/shacl.shacl.ttl'
import { PathFactory } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { ContextParser } from 'jsonld-context-parser'
import { rdfToStore } from '../helpers/rdfToStore'
import { Settings } from '../types/Settings'

export class ShapeDefinition {

  private loading: Promise<any>
  private shape: LDflexPath
  private settings: Settings

  constructor (settings: Settings, turtleShaclShape: string, subjectUri: string) {
    this.settings = settings
    this.loading = this.init(turtleShaclShape, subjectUri);
  }

  /**
   * Inits this shape definition, delegates enhancing it to the widgetsMatcher.
   */
  async init (turtleShaclShape: string, subjectUri: string) {
    const { store: shapes } = await rdfToStore(ShaclShaclShape)
    const { store: data, prefixes } = await rdfToStore(turtleShaclShape)

    const context = { '@context': prefixes }
    const contextParser = new ContextParser();
    this.settings.context = await contextParser.parse(context)

    this.validateShape(shapes, data)
    this.shape = await this.createLDflexPath(context, data, subjectUri)

    await this.settings.widgetsMatcher.match(this.settings, this.shape)
  }

  /**
   * Creates a LDflex path with a N3 store as source.
   */
  async createLDflexPath (context: { '@context': Prefixes }, data, subjectUri) {
    const queryEngine = new ComunicaEngine([data])
    const path = new PathFactory({ context, queryEngine })
    const expandedSubject = await this.settings.context.expandTerm(subjectUri)
    if (!expandedSubject) throw new Error(`Failed to expand the term: ${subjectUri}`)
    const subject = new NamedNode(expandedSubject)
    return path.create({ subject })
  }

  /**
   * Validates the shacl shape so we know we have atleast valid shacl.
   */
  async validateShape (shapes: Store, data: Store) {
    const validator = new SHACLValidator(shapes)
    const report = await validator.validate(data)
    if (!await report.conforms)
      throw new Error('Given SHACL does not validate.')
  }

  /**
   * Returns a LDflexPath for one predicate.
   */
  async get (predicate: string) {
    await this.loading
    const expandedPredicate = this.settings.context.expandTerm(predicate)
    const shaclProperties = this.shape['sh:property']

    for await (const shaclProperty of shaclProperties) {
      if (await shaclProperty['sh:path'].value === expandedPredicate) 
        return shaclProperty
    }
  }
}
