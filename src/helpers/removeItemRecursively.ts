import { LDflexPath } from '../types/LDflexPath'
import { WidgetBase } from '../Widgets/WidgetBase'
import { BindingsFactory } from '@comunica/bindings-factory';

const BF = new BindingsFactory();

/**
 * TODO this removes too much.
 * @param widget 
 * @param value 
 */
export const removeItemRecursively = async (widget: WidgetBase, value: LDflexPath) => {
  if (!value) widget.showEmptyItem = false
  else {
    const term = await value.term
    /** @ts-ignore */
    await widget.engine.engine.queryVoid(`
      delete { ?s ?p ?o }
      where {
        ?term (<http://a.com/a>|!<http://a.com/a>)* ?o . 
        ?s ?p ?o .
      }`, { 
      sources: [widget.store],
      initialBindings: BF.fromRecord({ term }),
    })
  }

  await widget.render()
}