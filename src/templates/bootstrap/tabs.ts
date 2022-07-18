import { html } from '../../helpers/uhtml'

export const tabs = (items: Array<[any, Array<string>]>, extraCssClasses: Array<string> = []) => {

  return html`<div class=${`nav nav-tabs ${extraCssClasses.join(' ')}`}>
    ${items.map(async (itemData) => {
      const item = itemData[0]
      const itemCssClasses = itemData[1]

      const hasActive = false
      return html`
      <div class=${`nav-item ${hasActive ? 'active' : ''} ${itemCssClasses ? itemCssClasses.join(' ') : ''}`}>
        ${item}
      </div>
      `
    })}
  </div>`
}