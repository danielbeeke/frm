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
    return this.settings.templates.grouper('address', html`
      ${this.settings.geocoder ? this.settings.templates.input('', null, (event) => this.search(event), 'search') : null}

      ${(
        await this.values.streetAddress || 
        await this.values.addressLocality
      ) ? html`
      <p>
        ${this.values.streetAddress}<br>
        ${this.values.postalCode} ${this.values.addressLocality}<br>
        ${this.values.addressRegion} ${this.values.addressCountry}
      </p>
      ` : null}

      ${this.settings.templates.button({
        cssClasses: [this.expanded ? 'active' : ''],
        inner: icon('gearFill'),
        callback: () => {
          this.expanded = !this.expanded
          this.render()
        }
      })}

      ${this.expanded ? Object.values(this.templates) : null}
  `)
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