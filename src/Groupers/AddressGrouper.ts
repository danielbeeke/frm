import { GrouperBase } from './GrouperBase'
import { html } from '../helpers/uhtml'

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

  async template () {
    return html`
      <div class="address-group">

        ${this.settings.geocoder ? html`
          <input type="search" onchange=${(event) => this.search(event)} />
        ` : null}

        <p>
        </p>

        <details>
          <summary>${this.t('edit-manually')}</summary>
          ${Object.values(this.templates)}
        </details>

      </div>
    `
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