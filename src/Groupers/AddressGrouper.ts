import { GrouperBase } from './GrouperBase'
import { html } from '../helpers/uhtml'

export class AddressGrouper extends GrouperBase {

  static applicablePredicateGroups = [
    [
      'schema:streetAddress',
      'schema:addressRegion',
      'schema:addressLocality',
      'schema:postalCode'
    ]
  ]

  async template () {
    return html`
      <div class="address-group">

        ${this.settings.geocoder ? html`
          <input type="search" onchange=${(event) => this.search(event)} />
        ` : null}

        <p>
          ${this.elements.streetAddress.getValue()}<br>
          ${this.elements.postalCode.getValue()}<br>
          ${this.elements.addressLocality.getValue()}<br>
          ${this.elements.addressRegion.getValue()}
        </p>

        <details>
          <summary>${this.t('edit-manually')}</summary>
          ${Object.values(this.elements)}
        </details>

      </div>
    `
  }

  async search (event: InputEvent) {
    const result = await this.settings.geocoder!.search((event.target as HTMLInputElement).value)
    if (!result) return
    
    await Promise.all([
      this.elements.streetAddress.setValue(`${result.street} ${result.number}`),
      this.elements.postalCode.setValue(result.postalCode),
      this.elements.addressLocality.setValue(result.locality),
      this.elements.addressRegion.setValue(result.region),
    ])

    this.render()
  }
}