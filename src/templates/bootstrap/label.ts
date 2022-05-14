import { html, Hole } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const label = (text: LDflexPath, inner: Array<Hole> = []) => {
  return html`
    <h5 class="label">
      ${text}
      ${inner.filter(Boolean).length ? inner.filter(Boolean) : null}
    </h5>
  `
}