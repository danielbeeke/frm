import { WidgetBase } from './WidgetBase'
import { StringBasedConstraints } from '../core/shaclProperties'
import { LDflexPath } from '../types/LDflexPath'
import { html } from '../helpers/uhtml'

export class StringWidget extends WidgetBase {

  static supportedDataTypes = ['xsd:string']
  static supportedProperties = [...StringBasedConstraints, 'html:placeholder']
  static commonNames = ['label', 'name']

  async item (value: LDflexPath) {
    const currentLanguage = this.settings.translator.current
    const labels = this.settings.internationalization.languageLabels[currentLanguage]

    return html`
      ${await value?.value ? html`
        <span class="language-label">
          ${await value?.language ? (labels[value.language] ?? value.language) : this.t('no-language')}
        </span>
      ` : null}
      
      <input 
        ref=${this.attributes()} 
        onchange=${async (event: InputEvent) => {
          const selectedLanguage = this.settings.internationalization.mode === 'tabs' ?
            this.settings.internationalization.current : 
            await value?.language

          const term = this.settings.dataFactory.literal((event.target as HTMLInputElement).value, selectedLanguage)
          this.setValue(term, value)
        }} 
        .value=${value} 
      />

      ${this.l10nSelector(value)}
    `
  }


}