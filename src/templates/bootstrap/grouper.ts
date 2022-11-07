import { html } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const grouper = ({ name, inner }: { name: string | LDflexPath, inner: any }) => {
  return html`
    <div class=${`grouper-${name} form-control pt-3`}>
      ${inner}
    </div>
  `
}