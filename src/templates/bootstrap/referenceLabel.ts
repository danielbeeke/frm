import { html } from '../../helpers/uhtml'
import { Meta } from '../../types/Meta'
import { Settings } from '../../types/Settings'
import { icon } from '../../helpers/icon'

export const referenceLabel = async ({
  meta, 
  suffix, 
  toggleButton, 
  expanded, 
  field, 
  searching, 
  settings, 
  closeCallback, 
  searchField, 
  searchResults,
  applySearchResult,
  loading
}: {
  meta: Meta, 
  suffix: any, 
  toggleButton: any, 
  expanded: boolean, 
  field: any, 
  searching: boolean, 
  settings: Settings,
  closeCallback: Function,
  searchField: any,
  searchResults: Array<Meta>,
  applySearchResult: (uri: string) => void,
  loading: boolean
}) => {

  const awaitedResults = await searchResults

  const modal = searching ? html`
    <div class="modal-backdrop fade show"></div>
      <div class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${settings.translator.t('reference-search-title')}</h5>
              <button type="button" class="btn-close" onclick=${closeCallback} aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${searchField}

              ${awaitedResults.length ? html`
              <ul class="list-group mt-3">
                ${awaitedResults.map((searchResult: Meta) => html`
                <button onclick=${() => applySearchResult(searchResult.uri)} type="button" class="list-group-item p-0 list-group-item-action d-flex">
                  ${searchResult.image ? html`<img onerror=${event => {
                    event.target?.remove()
                  }} src=${`//images.weserv.nl/?url=${searchResult.image}&h=38&w=38&fit=cover`} class="p-0" />` : null}
                  <div class="p-2">${searchResult.label ?? searchResult.uri}</div>
                </button>            
                `)}
              </ul>
              ` : null}
            </div>
          </div>
        </div>
    </div>
  ` : null

  return html`
    ${modal}
    ${expanded ? field : html`
      <div class=${`input-group text-nowrap ${expanded ? 'expanded' : ''}`}>
        ${meta ? html`
          ${meta.image ? html`<img onerror=${event => {
            event.target?.remove()
          }} src=${`//images.weserv.nl/?url=${meta.image}&h=40&w=40&fit=cover`} class="input-group-text p-0" />` : null}
          <a href=${meta.uri} target="_blank" class="form-control d-flex align-items-center text-nowrap">${meta.label ?? meta.uri}</a>        
        ` : html`
          <div class="form-control text-nowrap">${loading ? icon('loading') : settings.translator.t('reference-empty-title')}</div>
        `}
        ${toggleButton}      
        ${suffix}
      </div>
    `}
  `
}