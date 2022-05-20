import { html } from '../../helpers/uhtml'
import { replace } from '../../helpers/cssClassReplacer'

export const button = ({ inner, callback, cssClasses, isSubmit }: { 
  inner: any, callback: Function, cssClasses?: Array<string> , isSubmit?: boolean
}) => {
  if (!cssClasses) cssClasses = ['btn', 'btn-light']

  return html`
    <button type=${isSubmit ? null : 'button'} onclick=${callback} class=${replace(cssClasses).join(' ')}>
      ${inner}
    </button>
  `
}
