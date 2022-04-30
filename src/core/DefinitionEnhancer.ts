import { DefinitionEnhancerInterface } from './DefinitionEnhancerInterface'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { QueryEngine } from '@comunica/query-sparql'
import { ProxyHandlerStatic } from '@comunica/actor-http-proxy'
import { fetched } from '../helpers/fetched'
import { LDflexPath } from '../types/LDflexPath'
import { onlyUnique } from '../helpers/onlyUnique'
import { NamedNode } from 'n3'

const comunica = new QueryEngine()

export class DefinitionEnhancer implements DefinitionEnhancerInterface {
  async enhance (settings: Settings, shapeDefinition: ShapeDefinition) {

    // Make sure every shacl property has a frm:widget.
    for await (const shallowPredicatePath of shapeDefinition.shape['sh:property']) {
      const predicate = await shallowPredicatePath['sh:path'].value
      const predicatePath = shapeDefinition.getShaclProperty(predicate)

      await this.enhanceByOntology(settings, predicate, predicatePath)
      await this.enhanceByDeducing(settings, predicate, predicatePath)
    }

  }

  async enhanceByOntology (settings: Settings, predicate: string, predicatePath: LDflexPath) {
    const bindingsStream = await comunica.queryBindings(`SELECT * { ?s ?p ?o }`, {
      httpProxyHandler: settings.proxy ? new ProxyHandlerStatic(settings.proxy) : undefined,
      sources: [predicate],
      fetch: fetched // Ontology may be cached :)
    })

    const bindings = await bindingsStream.toArray()
    for (const binding of bindings) {
      const labelPredicate = binding.get('p')?.value.toString() as string
      await predicatePath.set({ [labelPredicate]: binding.get('o') })
    }
  }

  async enhanceByDeducing (settings: Settings, predicate: string, predicatePath: LDflexPath) {
    const isNode = await predicatePath['sh:node'].value
    const inValues = await predicatePath['sh:in'].list()

    /**
     * Resolve datatypes for dropdowns.
     */
    if (!isNode && !await predicatePath['sh:datatype'].value && await predicatePath['sh:in'].value && inValues) {
      const inTypes = inValues.map(item => item.datatype.id).filter(onlyUnique)
      if (inTypes.length > 1) throw new Error('Multiple datatypes given for dropdown. Not implemented yet')
      await predicatePath.set({ 'sh:datatype': new NamedNode(inTypes[0]) })
    }

    /**
     * maxCount is infinity if not given.
     */
    if (!await predicatePath['sh:maxCount'].value)
      await predicatePath.set({ 'sh:maxCount': Infinity })

  }
}