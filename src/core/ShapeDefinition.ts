import { LDflexPath } from '../types/LDflexPath'
import { NamedNode, Store } from 'n3'
import { PathFactory } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { rdfToStore } from '../helpers/rdfToStore'
import { Settings } from '../types/Settings'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { validateShaclString } from '../helpers/validateShaclString'
import { ProxyHandlerStatic } from '@comunica/actor-http-proxy'
import handlers from '../helpers/ldFlexSettings'

export class ShapeDefinition {

  public loading: Promise<any>
  public store: Store
  public shape: LDflexPath
  private settings: Settings
  private subjectUri: string

  constructor (settings: Settings, turtleShaclShape: string, subjectUri: string) {
    this.settings = settings
    this.subjectUri = subjectUri

    // You have to init this class with 'await' in front of it.
    /** @ts-ignore */
    return this.init(turtleShaclShape, subjectUri).then(async () => {
      // Fetch ontology data.
      await this.settings.definitionEnhancer.enhance(this.settings, this)

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

    const mergedContext = Object.assign(this.settings.context.getContextRaw(), prefixes)
    this.settings.context = new JsonLdContextNormalized(mergedContext) 

    this.store = data
    this.shape = await this.createLDflexPath(data, this.subjectUri)

    // We want SHACL shape validation but also performance
    setTimeout(() => validateShaclString(turtleShaclShape), 1000)
  }

  /**
   * Creates a LDflex path with a N3 store as source.
   */
  createLDflexPath (store, subjectUri) {
    const queryEngine = new ComunicaEngine([store], {
      options: { 
        httpProxyHandler: this.settings.proxy ? new ProxyHandlerStatic(this.settings.proxy) : undefined,
      }
    })
    const path = new PathFactory({ context: this.settings.context.getContextRaw(), queryEngine, handlers })
    const expandedSubject = this.settings.context.expandTerm(subjectUri)
    if (!expandedSubject) throw new Error(`Failed to expand the term: ${subjectUri}`)
    const subject = new NamedNode(expandedSubject)
    return path.create({ subject })
  }

  /**
   * Returns a LDflexPath for one predicate.
   */
   getShaclProperty (predicate: string) {
    const expandedPredicate = this.settings.context.expandTerm(predicate)
    const path = this.createLDflexPath(this.store, expandedPredicate)
    return path['^sh:path']
  }

  /**
   * Returns a LDflexPath for one predicate.
   */
   getShaclGroup (groupIRI: string) {
    const expandedGroupIRI = this.settings.context.expandTerm(groupIRI)
    return this.createLDflexPath(this.store, expandedGroupIRI)
  }
}
