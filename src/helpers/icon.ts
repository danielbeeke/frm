import info from 'bundle-text:bootstrap-icons/icons/info.svg'
import x from 'bundle-text:bootstrap-icons/icons/x.svg'
import { html } from 'uhtml'

const iconMap = {
  info,
  x,
}

export const icon = (name: keyof typeof iconMap) => {
  return html`<div ref=${element => element.innerHTML = iconMap[name]}></div>`
}