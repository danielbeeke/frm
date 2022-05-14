import { html } from '../../helpers/uhtml'

export const items = (items: Array<any>) => {
  return html.for({})`<div class="items">
    ${items.map(item => html`
    <div class="item">
      <div class="input-group">
        ${item}
      </div>
    </div>
    `)}
  </div>`
}