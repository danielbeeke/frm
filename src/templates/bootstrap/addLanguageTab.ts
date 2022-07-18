import { html } from '../../helpers/uhtml'

export const addLanguageTab = (inner: any, callback) => {
  return html`<button class="btn btn-light btn-sm dropdown-toggle relative" style="z-index: 11" type="button" onclick=${callback}}>
    ${inner}
  </button>`
}