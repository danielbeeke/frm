import { html } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const description = (text: LDflexPath) => {
  return html`
    <div class="alert alert-warning" role="alert">
      ${text}
    </div>
  `
}