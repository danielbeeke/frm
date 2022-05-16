import { html } from '../../helpers/uhtml'
import { replace } from './cssReplacements'

export const tabs = (items: Array<any>, extraCssClasses: Array<string> = []) => {
  return html`<div class=${`nav ${replace(extraCssClasses).join(' ')}`}>
    ${items.map(async item => {
      const inner = Array.isArray(item) ? await item[0] : await item
      const hasActive = inner.values.some(value => {
        if (typeof value === 'string') { return value.includes('active')}
      })
      return html`
      <div class=${`nav-item ${hasActive ? 'active' : ''} ${Array.isArray(item) ? replace(item[1]).join(' ') : ''}`}>
        ${inner}
      </div>
      `
    })}
  </div>`
}