import { html } from '../../helpers/uhtml'

export const grouperAddress = async (name: string, inner: any) => {
  const [search, currentValue] = await inner

  return html`
    <div class=${`grouper-${name} form-control pt-3`}>
      <div class="row">
        <div class="value-part col">
          ${currentValue}
        </div>

        <div class="search-part col">
          ${search}
        </div>
      </div>
    </div>
  `
}