import { icon } from '../../helpers/icon'
import { html, Hole } from '../../helpers/uhtml'

export const input = async (
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  type: string = 'text',
  suffix: Hole | null = null,
  placeholder: string = ''
) => {

  const resolvedSuffix = await suffix
  const suffixIsSvg = resolvedSuffix?.['template']?.[0]?.includes('svg')

  return html`
    <div class="input-group">
      <input class="form-control" placeholder=${placeholder} type=${type} .value=${value ?? ''} onchange=${onchange} ref=${ref ? ref : () => null} />
      ${suffixIsSvg ? html`<span class="input-group-text">${resolvedSuffix}</span>` : resolvedSuffix}
    </div>
  `
}