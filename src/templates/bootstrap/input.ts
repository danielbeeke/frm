import { html } from '../../helpers/uhtml'

export const input = (
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  type: string = 'text'
) => {
  return html`<input type=${type} .value=${value ?? ''} onchange=${onchange} ref=${ref ? ref : () => null} />`
}