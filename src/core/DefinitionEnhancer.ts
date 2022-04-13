import { DefinitionEnhancerInterface } from './DefinitionEnhancerInterface'
import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'
import { QueryEngine } from '@comunica/query-sparql'
import { ProxyHandlerStatic } from '@comunica/actor-http-proxy'
import { fetched } from '../helpers/fetched'

export class DefinitionEnhancer implements DefinitionEnhancerInterface {
  async enhance (settings: Settings, shapeDefinition: ShapeDefinition) {
    const comunica = new QueryEngine()

    // Make sure every shacl property has a frm:widget.
    for await (const shallowPredicatePath of shapeDefinition.shape['sh:property']) {
      const predicate = await shallowPredicatePath['sh:path'].value
      const predicatePath = shapeDefinition.get(predicate)

      const bindingsStream = await comunica.queryBindings(`SELECT * { ?s ?p ?o }`, {
        httpProxyHandler: new ProxyHandlerStatic(settings.proxy),
        sources: [predicate],
        fetch: fetched() // Ontology may be cached :)
      })

      const bindings = await bindingsStream.toArray()
      for (const binding of bindings) {
        const labelPredicate = binding.get('p')?.value.toString() as string
        await predicatePath.set({ [labelPredicate]: binding.get('o') })
      }
    }

  }
}