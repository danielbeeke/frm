const cssClassReplacements = {
  'button': 'btn',
  // 'danger': 'btn-secondary', 
  'primary': 'btn-primary',
  'tab': 'nav-link',
  'end': 'float-end',
  'title-button': 'btn-sm btn-light',
  'remove-item': 'btn-sm btn-outline-secondary',
  'language-toggle': 'btn-outline-secondary',
  'expand-address-grouper': 'float-end btn-light mt-2',
  'language-tabs': 'relative nav-tabs mb-4 flex-nowrap',
  'add-language-button': 'ms-auto add-language-button'
}

export const replace = (cssClasses: Array<string>) => {
  return cssClasses.map(cssClass => cssClassReplacements[cssClass] ?? cssClass)
}