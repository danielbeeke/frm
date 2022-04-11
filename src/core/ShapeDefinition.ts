import { LDflexPath } from '../types/LDflexPath'
import SHACLValidator from 'rdf-validate-shacl'
import { NamedNode, Prefixes, Store } from 'n3'
import ShaclShaclShape from '../shapes/shacl.shacl.ttl'
import { PathFactory } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { ContextParser } from 'jsonld-context-parser'
import { rdfToStore } from '../helpers/rdfToStore'
import { Settings } from '../types/Settings'
import basePrefixes from '../helpers/basePrefixes'

export class ShapeDefinition {

  public loading: Promise<any>
  public shape: LDflexPath
  private settings: Settings
  private store: Store
  private rawContext

  constructor (settings: Settings, turtleShaclShape: string, subjectUri: string) {
    this.settings = settings

    /** @ts-ignore */
    return this.init(turtleShaclShape, subjectUri).then(() => {
      return this.settings.widgetsMatcher.match(this.settings, this).then(() => this)
    })
  }

  /**
   * Inits this shape definition, delegates enhancing it to the widgetsMatcher.
   */
  async init (turtleShaclShape: string, subjectUri: string) {
    const { store: shapes } = await rdfToStore(ShaclShaclShape)
    const { store: data, prefixes } = await rdfToStore(turtleShaclShape)
    this.store = data

    this.rawContext = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
    const contextParser = new ContextParser();
    this.settings.context = await contextParser.parse(this.rawContext)

    this.validateShape(shapes, data)
    this.shape = await this.createLDflexPath(this.rawContext, data, subjectUri)
  }

  /**
   * Creates a LDflex path with a N3 store as source.
   */
  createLDflexPath (context: { '@context': Prefixes }, data, subjectUri) {
    const queryEngine = new ComunicaEngine([data])
    const path = new PathFactory({ context, queryEngine })
    const expandedSubject = this.settings.context.expandTerm(subjectUri)
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
  get (predicate: string) {
    const expandedPredicate = this.settings.context.expandTerm(predicate)
    const path = this.createLDflexPath({ '@context': this.rawContext }, this.store, expandedPredicate)
    return path['^sh:path']
  }
}
