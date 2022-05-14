import { html } from '../../helpers/uhtml'

export const small = (inner: any) => {
  return html`<em class="small">
    ${inner}
  </em>`
}