import { html } from '../../helpers/uhtml'
import { LDflexPath } from '../../types/LDflexPath'

export const group = async (name: string | LDflexPath, label: any, inner: any, extraCssClasses: Array<string> = []) => {
  const resolvedName = name ? (await name.value ?? name).toLowerCase() : ''

  return html`
    <div class=${`group${resolvedName ? '-' + resolvedName : ''} ${extraCssClasses?.join()}`}>
      ${label ? html`<h3 class="group-label">${label}</h3>` : null}
      ${inner}
    </div>
  `
}