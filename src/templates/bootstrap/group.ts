import { html } from '../../helpers/uhtml'

export const group = (name: string, label: any, inner: any, extraCssClasses: Array<string> = []) => {
  return html`
    <div class=${`group-${name} ${extraCssClasses?.join()}`}>
      <h3 class="group-label">${label}</h3>
      ${inner}
    </div>
  `
}