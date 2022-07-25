import { html } from '../../helpers/uhtml'

export const grouperAddress = async (name: string, inner: any) => {
  const {
    expanded,
    hasValue,
    searchField,
    expandButton,
    valueDisplay,
    fields
  } = await inner

  return html`<div class=${`grouper-${name} form-control pt-3 pb-3 d-flex flex-wrap`}>
    ${!expanded ? html`
      <div class="col">
        ${hasValue ? valueDisplay : searchField}
      </div>

      <div class="ps-2">
          ${expandButton}
      </div>
    ` : html`
      <div class="col pb-3">
        ${searchField}
      </div>

      <div class="ps-2">
          ${expandButton}
      </div>
      <hr class="col-12">
      <div class="col-12">
        ${fields}
      </div>

    `}
  </div>`
}