import { html } from '../../helpers/uhtml'

export const button = ({ inner, callback, cssClasses, isSubmit }: { 
  inner: any, callback: Function, cssClasses?: Array<string> , isSubmit?: boolean
}) => {
  if (!cssClasses) cssClasses = ['btn', 'btn-light']
  return html`
    <button type=${isSubmit ? null : 'button'} onclick=${callback} class=${cssClasses.join(' ')}>
      ${inner}
    </button>
  `
}