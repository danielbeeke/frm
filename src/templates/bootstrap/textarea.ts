import { html, Hole } from '../../helpers/uhtml'

export const textarea = async (
  value: string | number | boolean, 
  ref: Promise<(element: HTMLElement) => void> | null, 
  onchange: (event: InputEvent) => void,
  suffix: Hole | null = null,
  placeholder: string = ''
) => {

  const resolvedSuffix = await suffix
  const suffixIsSvg = resolvedSuffix?.['template']?.[0]?.includes('svg')

  return html`
    <div class="input-group">
      <textarea .value=${value} class="form-control" placeholder=${placeholder} onchange=${onchange} ref=${ref ? ref : () => null}></textarea>
      ${suffixIsSvg ? html`<span class="input-group-text">${resolvedSuffix}</span>` : resolvedSuffix}
    </div>
  `
}