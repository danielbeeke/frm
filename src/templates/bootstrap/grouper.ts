import { html } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const grouper = ({ context, inner }: { context: string | LDflexPath, inner: any }) => {
  return html`
    <div class=${`grouper-${context} form-control pt-3`}>
      ${inner}
    </div>
  `
}