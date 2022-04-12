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
import { QueryEngine } from '@comunica/query-sparql'

export class ShapeDefinition {

  public loading: Promise<any>
  public shape: LDflexPath
  public store: Store
  private settings: Settings
  private rawContext
  private predicatesWithProperties
  private subjectUri: string

  constructor (settings: Settings, turtleShaclShape: string, subjectUri: string) {
    this.settings = settings
    this.subjectUri = subjectUri

    // You have to init this class with 'await' in front of it.
    /** @ts-ignore */
    return this.init(turtleShaclShape, subjectUri).then(() => {

      // When this class is loaded we trigger the widgetsMatcher.
      // After this is all loaded our shacl definitions all have a frm:widget.
      return this.settings.widgetsMatcher.match(this.settings, this).then(() => this)
    })
  }

  /**
   * Inits this shape definition, delegates enhancing it to the widgetsMatcher.
   */
  async init (turtleShaclShape: string) {
    const { store: shapes } = await rdfToStore(ShaclShaclShape)
    const { store: data, prefixes } = await rdfToStore(turtleShaclShape)
    this.store = data

    this.rawContext = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
    const contextParser = new ContextParser();
    this.settings.context = await contextParser.parse(this.rawContext)

    // We want SHACL shape validation but also performance
    setTimeout(() => this.validateShape(shapes, data, turtleShaclShape), 1000)
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
  async validateShape (shapes: Store, data: Store, turtleShaclShape: string) {
    const validator = new SHACLValidator(shapes)
    const report = await validator.validate(data)
    if (!await report.conforms)
      throw new Error('Given SHACL does not validate. There is an error in the following: \n\n' + turtleShaclShape)
  }

  /**
   * Returns a LDflexPath for one predicate.
   */
  get (predicate: string) {
    const predicateExpanded = this.settings.context.expandTerm(predicate)!
    return this.predicatesWithProperties[predicateExpanded]
  }

  async getPredicatesWithProperties (): Promise<{ [subject: string]: { [predicate: string]: Array<any> } }> {
    if (!this.predicatesWithProperties) {
      const expandedShapeSubject = this.settings.context.expandTerm(this.subjectUri)

      const bindingsStream = await new QueryEngine().queryBindings(`
        PREFIX sh: <${this.settings.context.getContextRaw().sh}>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

        SELECT * {
          <${expandedShapeSubject}> sh:property ?shacl_property .
          ?shacl_property sh:path ?subject .
          ?shacl_property ?predicate ?object .
        }
      `, {
        sources: [this.store]
      })

      const bindings = await bindingsStream.toArray()

      this.predicatesWithProperties = {}
      for (const binding of bindings) {
        const subjectExpanded = binding.get('subject')?.value!

        const propertyExpanded = binding.get('predicate')?.value!
        const propertyCompacted = this.settings.context.compactIri(propertyExpanded)

        if (!this.predicatesWithProperties[subjectExpanded]) this.predicatesWithProperties[subjectExpanded] = {}
        if (!this.predicatesWithProperties[subjectExpanded][propertyCompacted]) this.predicatesWithProperties[subjectExpanded][propertyCompacted] = []

        this.predicatesWithProperties[subjectExpanded][propertyCompacted].push(binding.get('object'))
      }
    }
    
    return this.predicatesWithProperties
  }
}
