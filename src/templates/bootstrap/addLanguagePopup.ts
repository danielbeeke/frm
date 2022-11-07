import { html } from '../../helpers/uhtml'

export const addLanguagePopup = ({ inner }: { inner: any }) => {
  return html`
    <div class="fixed-bcp47-picker bg-light p-3 d-flex rounded shadow">
      ${inner}
    </div>  
  `
}