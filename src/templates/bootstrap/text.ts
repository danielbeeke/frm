import { html } from '../../helpers/uhtml'

export const text = (inner: any) => {
  return html`<div>
    ${inner}
  </div>`
}