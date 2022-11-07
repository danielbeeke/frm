import { GrouperBase } from './GrouperBase'
import { html } from '../helpers/uhtml'
import { icon } from '../helpers/icon'

export class AddressGrouper extends GrouperBase {

  static applicablePredicateGroups = [
    [
      'rdf:type',
      'schema:streetAddress',
      'schema:addressRegion',
      'schema:addressLocality',
      'schema:postalCode',
      'schema:addressCountry'
    ]
  ]

  public expanded: boolean = false

  async template () {
    const hasValue = await this.values['schema:streetAddress'] || await this.values['schema:addressLocality']

    const searchField = this.settings.geocoder ? this.settings.templates.apply('input', {
      onchange: (event) => this.search(event),
      type: 'search',
      placeholder: await this.t('address-autocomplete-placeholder'),
    }) : null

    const expandButton = this.settings.templates.apply('button', {
      context: 'expand',
      cssClasses: [this.expanded ? 'active' : '', 'end'],
      inner: icon('gearFill'),
      callback: async () => {
        this.expanded = !this.expanded
        await this.render()
      }
    })

    const valueDisplay = hasValue && !this.expanded ? this.settings.templates.apply('text', {
      text: html`
        ${this.values['schema:streetAddress']}<br>
        ${this.values['schema:postalCode']} ${this.values['schema:addressLocality']}<br>
        ${this.values['schema:addressRegion']} ${this.values['schema:addressCountry']}
      `
    }) : null

    const fields = html`
      <div>
        ${this.fieldTemplates()}
      </div>
    `

    return {
      expanded: this.expanded,
      hasValue,
      searchField,
      expandButton,
      valueDisplay,
      fields
    }
  }

  async search (event: InputEvent) {
    const result = await this.settings.geocoder!.search((event.target as HTMLInputElement).value)
    if (!result) return

    await Promise.all([
      this.fields['schema:streetAddress'].setValue(`${result.street} ${result.number}`),
      this.fields['schema:postalCode'].setValue(result.postalCode),
      this.fields['schema:addressLocality'].setValue(result.locality),
      this.fields['schema:addressRegion'].setValue(result.region),
      this.fields['schema:addressCountry'].setValue(result.country),
    ])

    await this.render()
  }
}