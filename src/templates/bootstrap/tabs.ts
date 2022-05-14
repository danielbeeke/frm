import { html } from '../../helpers/uhtml'

export const tabs = (items: Array<any>) => {
  return html`<div class="nav nav-tabs mb-4">
    ${items.map(item => html`
    <div class="nav-item">
      ${item}
    </div>
    `)}
  </div>`
}