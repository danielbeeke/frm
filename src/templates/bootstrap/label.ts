import { html, Hole } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const label = async ({ text, inner }: { text: LDflexPath, inner: Array<Hole> }) => {
  return await text ? html`
  <div class="label-wrapper d-flex align-items-end">
    <label class="form-label text-capitalize">
      ${text}
    </label>

    ${inner ? html`
    <div class="mb-1 ms-2 d-flex flex-fill flex-row-reverse">
    ${inner.filter(Boolean).length ? inner.filter(Boolean) : null}
    </div>
    ` : null}
  </div>
  ` : null
}