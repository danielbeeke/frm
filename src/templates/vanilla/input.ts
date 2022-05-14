import { html, Hole } from '../../helpers/uhtml'

export const input = (
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  type: string = 'text',
  suffix: Hole | null = null,
  placeholder: string = ''
) => {
  return html`
    <input type=${type} placeholder=${placeholder} .value=${value ?? ''} onchange=${onchange} ref=${ref ? ref : () => null} />
    <span>${suffix}</span>
  `
}