import { html } from '../../helpers/uhtml'

const contextMapping = {
  'form-actions': 'form-actions pb-2 d-flex flex-row-reverse'
}

export const container = ({ inner, context }: { inner: any, context: string }) => {
  return html`
  <div class=${contextMapping[context] ?? context}>
    ${inner}
  </div>
  `
}