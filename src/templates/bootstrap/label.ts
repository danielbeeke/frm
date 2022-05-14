import { html, Hole } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const label = (text: LDflexPath, inner: Array<Hole> = []) => {
  return html`
  <div class="label-wrapper d-flex align-items-end">
    <label class="form-label text-capitalize">
      ${text}
    </label>

    <span class="m-auto"></span>
    <div class="mb-1 btn-group">
    ${inner.filter(Boolean).length ? inner.filter(Boolean) : null}
    </div>
  </div>
  `
}