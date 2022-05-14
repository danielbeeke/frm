import { html } from '../../helpers/uhtml'

export const items = (items: Array<any>) => {
  return html`<div class="items mb-4">
    ${items.map(item => html`
      <div class="d-block mb-2">
        <div class="input-group">
          ${typeof item === 'string' ? html`
            <span class="form-control">
              ${item}
            </span>
          ` : item}
        </div>
      </div>
    `)}
  </div>`
}