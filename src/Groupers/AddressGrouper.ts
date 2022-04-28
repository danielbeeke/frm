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
    console.log(this.values)

    return html`
      <div class="address-group">

        ${this.settings.geocoder ? html`
          <input type="search" onchange=${(event) => this.search(event)} />
        ` : null}

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

        <details>
          <summary>${this.t('edit-manually')}</summary>
          ${Object.values(this.values)}
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