import { html } from '../helpers/uhtml'

/**
 * Generic dropdown template
 */
export const dropdown = ({ options, selectedValue = null, placeholder = null, callback = null }: {
  options: { [key: string]: string }, 
  selectedValue: string | null, 
  placeholder: string | null, 
  callback?: Function | null
}) => {
  return html`
    <select onchange=${(event: InputEvent) => callback ? callback((event.target as HTMLInputElement).value) : null}>
      ${!selectedValue && !('' in options) ? html`<option selected disabled>${placeholder}</option>` : null}
      ${Object.entries(options).map(([value, label]) => html`
        <option value=${value} ?selected=${value === selectedValue ? true : null}>
          ${label}
        </option>
      `)}
    </select>
  `
}

/**
 * Generic button template
 */
export const button = ({ inner, callback, cssClasses, isSubmit }: { 
  inner: any, callback: Function, cssClasses?: Array<string> , isSubmit?: boolean
}) => {
  if (!cssClasses) cssClasses = ['button', 'primary']
  return html`
    <button type=${isSubmit ? null : 'button'} onclick=${callback} class=${cssClasses.join(' ')}>
      ${inner}
    </button>
  `
}
