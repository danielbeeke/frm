import { html } from '../../helpers/uhtml'

export const tabs = (items: Array<any>) => {
  return html`<div class="tabs">
    ${items.map(item => html`
    <div class="tab">
      ${item}
    </div>
    `)}
  </div>`
}