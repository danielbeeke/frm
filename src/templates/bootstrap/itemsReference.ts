import { html } from '../../helpers/uhtml'

export const itemsReference = ({
  items,
  after
}: {
  items: Array<any>, 
  after: any
}) => {

  return html`
  <div class="mb-3">
  <div class="items mb-2 d-flex align-items-start flex-wrap gap-3">
    ${items.map(item => html`
      <div class="d-flex">
        <div class="input-group">
          ${typeof item === 'string' ? html`
            <span class="form-control">
              ${item}
            </span>
          ` : item}
        </div>
      </div>
    `)}
    </div>
    ${after}
  </div>`
}