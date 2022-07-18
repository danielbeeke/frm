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
    return [html`
      ${this.settings.geocoder ? this.settings.templates.apply('input', 
        '', 
        null, 
        (event) => this.search(event), 
        'search', 
        icon('search'), 
        await this.t('address-autocomplete-placeholder')
      ) : null}
    `, html`

      ${this.settings.templates.apply('button', {
        context: 'expand',
        cssClasses: [this.expanded ? 'active' : '', 'end'],
        inner: icon('gearFill'),
        callback: () => {
          this.expanded = !this.expanded
          this.render()
        }
      })}    

      ${(
        await this.values.streetAddress || 
        await this.values.addressLocality
      ) ? this.settings.templates.apply('text', html`
        ${this.values.streetAddress}<br>
        ${this.values.postalCode} ${this.values.addressLocality}<br>
        ${this.values.addressRegion} ${this.values.addressCountry}
      `) : null}

      ${this.expanded ? Object.values(this.templates) : null}
    `]
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