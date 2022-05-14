import { html } from '../../helpers/uhtml'

export const list = (items: Array<any>) => {
  return html`
  <ul>
    ${items.map(item => html`<li>${item}</li>`)}
  </ul>
  `
}