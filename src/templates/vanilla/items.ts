import { html } from '../../helpers/uhtml'

export const items = (items: Array<any>) => {
  return html`<div class="items">
    ${items.map(item => html`
    <div class="item">
      ${item}
    </div>
    `)}
  </div>`
}