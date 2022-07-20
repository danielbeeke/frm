import { GrouperBase } from './GrouperBase'
import { html } from '../helpers/uhtml'
import { icon } from '../helpers/icon'

export class AddressGrouper extends GrouperBase {

  static applicablePredicateGroups = [
    [
      'schema:streetAddress',
      'schema:addressRegion',
      'schema:addressLocality',
      'schema:postalCode',
      'schema:addressCountry'
    ]
  ]

  public expanded: boolean = false

  async template () {
    const hasValue = await this.values.streetAddress || await this.values.addressLocality

    const searchField = this.settings.geocoder ? this.settings.templates.apply('input', {
      onchange: (event) => this.search(event),
      type: 'search',
      placeholder: await this.t('address-autocomplete-placeholder'),
    }) : null

    const expandButton = this.settings.templates.apply('button', {
      context: 'expand',
      cssClasses: [this.expanded ? 'active' : '', 'end'],
      inner: icon('gearFill'),
      callback: () => {
        this.expanded = !this.expanded
        this.render()
      }
    })

    const valueDisplay = (
      await this.values.streetAddress || 
      await this.values.addressLocality
    ) && !this.expanded ? this.settings.templates.apply('text', html`
      ${this.values.streetAddress}<br>
      ${this.values.postalCode} ${this.values.addressLocality}<br>
      ${this.values.addressRegion} ${this.values.addressCountry}
    `) : null

    const fields = html`
      <div>
        ${Object.values(this.templates)}
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
      this.values.streetAddress.setValue(`${result.street} ${result.number}`),
      this.values.postalCode.setValue(result.postalCode),
      this.values.addressLocality.setValue(result.locality),
      this.values.addressRegion.setValue(result.region),
      this.values.addressCountry.setValue(result.country),
    ])

    await this.render()
  }
}