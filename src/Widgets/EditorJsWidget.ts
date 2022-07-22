import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import EditorJS from '@editorjs/editorjs'
import { html } from '../helpers/uhtml'
import { debounce } from '../helpers/debounce'

let cache = new Map()

export class EditorJsWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:rows', 'html:placeholder']
  static commonNames = ['description', 'abstract', 'text']

  async parsedValue (index: number) {
    const value = await this.getValue(index)
    return await value?.value ? JSON.parse(atob(await value?.value)) : null
  }

  /**
   * The form widget using EditorJs
   */
  async item (value: LDflexPath, index: number) {
    const cid = `${this.predicate}|${index}`
    const element = cache.get(cid) ?? document.createElement('div')

    console.log(cid)

    if (!cache.has(cid)) {
      cache.set(cid, element)
      element.classList.add('form-control')
      element.classList.add('editor-widget')

      element.editor = new EditorJS(Object.assign({
        minHeight: 100,
      }, this.settings.editorJs, {
        logLevel: 'ERROR',
        holder: element,
        onChange: debounce(async () => {
          const newData = await element.editor.save()
          const newValue = this.settings.dataFactory.literal(btoa(JSON.stringify(newData)))
          await this.setValue(newValue, await this.getValue(index))
        }, 500),
        data: await this.parsedValue(index)
      }))
    }

    return html`
      ${element}
      ${this.removeButton(value)}
    `
  }

  /**
   * When removing we need to refresh the widgets 
   * after the one that is removed so they render the next item.
   */
  async removeItem (value: LDflexPath | null = null) {
    await super.removeItem(value)

    const newCache = new Map()
    let counter = 0

    for (const [index, element] of [...cache.values()].entries()) {
      if (element.isConnected) {
        const data = await this.parsedValue(index)
        if (data) {
          element.editor.render(data)
        }
        else {
          element.editor.clear()
        }
        newCache.set(`${this.predicate}|${counter}`, element)
        counter++  
      }
    }

    cache = newCache
  }
}