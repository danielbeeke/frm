import { html, Hole } from '../../helpers/uhtml'

export const tooltip = async ({ icon, context, text }: {
  icon: Hole, context: string, text: string
}) => {
  return html`
  <button type="button" class="btn tooltip-btn text-muted"
    data-bs-toggle="tooltip" data-bs-placement="top"
    data-bs-custom-class=${`tooltip-${context}`}
    data-bs-title=${text}>
    ${icon}
  </button>
  `
}