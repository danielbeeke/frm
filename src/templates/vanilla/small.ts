import { html } from '../../helpers/uhtml'

export const small = (inner: any) => {
  return html`<em>
    ${inner}
  </em>`
}