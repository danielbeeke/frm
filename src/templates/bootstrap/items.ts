import { html } from '../../helpers/uhtml'

export const items = ({
  items,
  after
}: {
  items: Array<any>, 
  after: any
}) => {

  return html`<div class="items mb-3 d-flex flex-column justify-content-end">
    ${items.map(item => html`
      <div class="d-block mb-2">
        <div class="input-group flex-nowrap">
          ${typeof item === 'string' ? html`
            <span class="form-control">
              ${item}
            </span>
          ` : item}
        </div>
      </div>
    `)}

    ${after}
  </div>`
}