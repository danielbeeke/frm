import { html } from '../../helpers/uhtml'

export const dropdown = ({ options, selectedValue = null, placeholder = null, callback = null }: {
  options: { [key: string]: string }, 
  selectedValue: string | null, 
  placeholder: string | null, 
  callback?: Function | null
}) => {
  return html`
    <select class="form-select" onchange=${(event: InputEvent) => callback ? callback((event.target as HTMLInputElement).value) : null}>
      ${!selectedValue && !('' in options) ? html`<option selected disabled>${placeholder}</option>` : null}
      ${Object.entries(options).map(([value, label]) => html`
        <option value=${value} ?selected=${value === selectedValue ? true : null}>
          ${label}
        </option>
      `)}
    </select>
  `
}