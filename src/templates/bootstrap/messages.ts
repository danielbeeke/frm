import { html } from '../../helpers/uhtml'

const typeMapping = {
  'error': 'alert-danger',
  'info': 'alert-primary'
}

export const messages = (inner: any, type: 'error' | 'info') => {
  return html`
  <div class=${`alert ${typeMapping[type]}`}>
    ${inner}
  </div>
  `
}