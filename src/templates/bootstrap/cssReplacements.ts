const cssClassReplacements = {
  'button': 'btn',
  'danger': 'btn-secondary', 
  'primary': 'btn-primary',
  'tab': 'nav-link',
  'end': 'float-end',
  'title-button': 'btn-sm btn-light',
  'remove-item': 'btn-sm',
  'expand-address-grouper': 'float-end btn-light mt-2'
}

export const replace = (cssClasses: Array<string>) => {
  return cssClasses.map(cssClass => cssClassReplacements[cssClass] ?? cssClass)
}