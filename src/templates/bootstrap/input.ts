import { html, Hole } from '../../helpers/uhtml'
import { debounce } from '../../helpers/debounce'

export const input = async ({
  value,
  ref, 
  onchange,
  onblur,
  onkeyup,
  type,
  suffix,
  placeholder,
  context,
  disableForce
}: {
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  onkeyup: (event: InputEvent) => void,
  onblur: (event: InputEvent) => void,
  type: string,
  suffix: Hole | null,
  placeholder: string,
  context?: string,
  disableForce?: boolean
}) => {
  const resolvedSuffix = await suffix
  const suffixIsSvg = resolvedSuffix?.['template']?.[0]?.includes('svg')

  if (!onkeyup) onkeyup = () => null

  return html`
    <div class=${`input-group ${context === 'expanded' ? 'expanded' : ''}`}>
      ${disableForce ? html`
        <input class="form-control" placeholder=${placeholder} onkeyup=${debounce(onkeyup, 500)} type=${type} value=${value ?? ''} onchange=${onchange} onblur=${onblur} ref=${ref ? ref : () => null} />
      ` : html`
        <input class="form-control" placeholder=${placeholder} onkeyup=${debounce(onkeyup, 500)} type=${type} .value=${value ?? ''} onchange=${onchange} onblur=${onblur} ref=${ref ? ref : () => null} />
      `}      
      ${suffixIsSvg ? html`<span class="input-group-text">${resolvedSuffix}</span>` : resolvedSuffix}
    </div>
  `
}