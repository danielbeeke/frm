import { LDflexPath } from '../types/LDflexPath'
import { NamedNode, Prefixes, Store } from 'n3'
import { PathFactory, defaultHandlers } from 'ldflex'
import defaultIterationHandlers from '@ldflex/async-iteration-handlers'
import ComunicaEngine from '@ldflex/comunica'
import { ContextParser } from 'jsonld-context-parser'
import { rdfToStore } from '../helpers/rdfToStore'
import { Settings } from '../types/Settings'
import basePrefixes from '../helpers/basePrefixes'
import { validateShaclString } from '../helpers/validateShaclString'

export class ShapeDefinition {

  public loading: Promise<any>
  public store: Store
  public shape: LDflexPath
  private settings: Settings
  private rawContext
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
    const { store: data, prefixes } = await rdfToStore(turtleShaclShape)
    this.store = data

    this.rawContext = { '@context': {...JSON.parse(JSON.stringify(prefixes)), ...basePrefixes} }
    const contextParser = new ContextParser();
    this.settings.context = await contextParser.parse(this.rawContext)
    this.shape = await this.createLDflexPath(this.rawContext, data, this.subjectUri)

    // We want SHACL shape validation but also performance
    setTimeout(() => validateShaclString(turtleShaclShape), 1000)
  }

  /**
   * Creates a LDflex path with a N3 store as source.
   */
  createLDflexPath (context: { '@context': Prefixes }, data, subjectUri) {
    const queryEngine = new ComunicaEngine([data])
    const path = new PathFactory({ context, queryEngine, handlers: {
      ...defaultHandlers,
      ...defaultIterationHandlers
    }})
    const expandedSubject = this.settings.context.expandTerm(subjectUri)
    if (!expandedSubject) throw new Error(`Failed to expand the term: ${subjectUri}`)
    const subject = new NamedNode(expandedSubject)
    return path.create({ subject })
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
