import { html } from '../../helpers/uhtml'

export const text = ({ text }: { text: any }) => {
  return html`<div>
    ${text}
  </div>`
}