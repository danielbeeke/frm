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
import { hash } from 'spark-md5'
import { storeToTurtle } from '../helpers/storeToTurtle'

const engines: any = new Map()

export class ShapeDefinition {

  public loading: Promise<any>
  public store: Store
  public shape: LDflexPath
  private settings: Settings
  public subjectUri: string

  constructor (settings: Settings, turtleShaclShape: string, subjectUri: string) {
    this.settings = settings
    this.subjectUri = subjectUri

    // You have to init this class with 'await' in front of it.
    /** @ts-ignore */
    return this.init(turtleShaclShape, subjectUri).then(() => this)
  }

  /**
   * Inits this shape definition, delegates enhancing it to the widgetsMatcher.
   */
  async init (turtleShaclShape: string, subjectUri: string) {

    const turtleId = `${hash(turtleShaclShape)}-${this.settings.context.compactIri(subjectUri)}`
    this.settings.logger.log(`Loading shape ${this.settings.context.compactIri(subjectUri)}`)
    const cacheEnhancedTurtleShaclShape = localStorage.getItem(turtleId)

    /**
     * Put it into the cache
     */
    if (!cacheEnhancedTurtleShaclShape) {
      this.settings.logger.log(`Getting ${this.settings.context.compactIri(subjectUri)} shape meta from network`)

      const { store: data, prefixes } = await rdfToStore(turtleShaclShape)

      const mergedContext = Object.assign(this.settings.context.getContextRaw(), prefixes)
      this.settings.context = new JsonLdContextNormalized(mergedContext) 
  
      this.store = data
      this.shape = await this.createLDflexPath(data, this.subjectUri)
  
      // We want SHACL shape validation but also performance
      setTimeout(() => validateShaclString(turtleShaclShape), 4000)
  
      // Fetch ontology data.
      await this.settings.definitionEnhancer.enhance(this.settings, this)
  
      // When this class is loaded we trigger the widgetsMatcher.
      // After this is all loaded our shacl definitions all have a frm:widget.
      await this.settings.widgetsMatcher.match(this.settings, this)

      const newCacheTurtle = await storeToTurtle(this.store)
      localStorage.setItem(turtleId, newCacheTurtle)
      localStorage.setItem(turtleId + 'prefixes', JSON.stringify(prefixes))
    }

    /**
     * Cache version
     */
    else {
      const cachedPrefixes = JSON.parse(localStorage.getItem(turtleId + 'prefixes')!)

      this.settings.logger.log(`Getting ${this.settings.context.compactIri(subjectUri)} shape meta from cache`)
      const { store: data, prefixes } = await rdfToStore(cacheEnhancedTurtleShaclShape)
      const mergedContext = Object.assign(this.settings.context.getContextRaw(), prefixes, cachedPrefixes)
      this.settings.context = new JsonLdContextNormalized(mergedContext) 
      this.store = data
      this.shape = await this.createLDflexPath(data, this.subjectUri)
    }

    return this
  }

  /**
   * Creates a LDflex path with a N3 store as source.
   */
  createLDflexPath (store, subjectUri) {
    if (!engines.get(store)) {
      const queryEngine = new ComunicaEngine([store], {
        options: { 
          httpProxyHandler: this.settings.proxy ? new ProxyHandlerStatic(this.settings.proxy) : undefined,
        }
      })

      const path = new PathFactory({ context: this.settings.context.getContextRaw(), queryEngine, handlers })
      engines.set(store, path)
    }

    const expandedSubject = this.settings.context.expandTerm(subjectUri)
    if (!expandedSubject) throw new Error(`Failed to expand the term: ${subjectUri}`)
    const subject = new NamedNode(expandedSubject)
    return engines.get(store).create({ subject })
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
