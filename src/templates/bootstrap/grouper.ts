import { html } from '../../helpers/uhtml'

export const grouper = (name: string, inner: any) => {
  return html`
    <div class=${`grouper-${name} form-control pt-3`}>
      ${inner}
    </div>
  `
}