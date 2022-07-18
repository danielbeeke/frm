import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html, render } from '../helpers/uhtml'
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import List from '@editorjs/list'; 

export class EditorJsWidget extends WidgetBase {

  /**
   * These properties can be used by the widgetMatcher
   */
  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:rows', 'html:placeholder']
  static commonNames = ['description', 'abstract', 'text']


  async item (value: LDflexPath) {
    return html`<div class="col-12 form-control" ref=${element => {
      if (element.editor) return
      
      element.editor = new EditorJS({
        holder: element,
          /** 
           * Available Tools list. 
           * Pass Tool's class or Settings object for each Tool you want to use 
           */ 
          tools: { 
            header: Header, 
            list: List 
          },
      })
    }}></div>
    ${this.removeButton(value)}
    `
  }

}