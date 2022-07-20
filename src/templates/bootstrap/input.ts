import { html, Hole } from '../../helpers/uhtml'

export const input = async ({
  value,
  ref, 
  onchange,
  onblur,
  type,
  suffix,
  placeholder
}: {
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  onblur: (event: InputEvent) => void,
  type: string,
  suffix: Hole | null,
  placeholder: string
}) => {

  const resolvedSuffix = await suffix
  const suffixIsSvg = resolvedSuffix?.['template']?.[0]?.includes('svg')

  return html`
    <div class="input-group">
      <input class="form-control" placeholder=${placeholder} type=${type} .value=${value ?? ''} onchange=${onchange} onblur=${onblur} ref=${ref ? ref : () => null} />
      ${suffixIsSvg ? html`<span class="input-group-text">${resolvedSuffix}</span>` : resolvedSuffix}
    </div>
  `
}