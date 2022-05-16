import { html } from '../../helpers/uhtml'

export const tabs = (items: Array<any>, extraCssClasses: Array<string> = []) => {
  return html`<div class=${`tabs ${extraCssClasses.join(' ')}`}>
    ${items.map(item => html`
    <div class=${`tab ${Array.isArray(item) ? item[1] : ''}`}>
      ${Array.isArray(item) ? item[0] : item}
    </div>
    `)}
  </div>`
}