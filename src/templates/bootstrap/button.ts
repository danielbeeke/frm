import { html } from '../../helpers/uhtml'

const buttonMapping = {
  'language-tab': 'nav-link',
  'add-language-submit': 'btn btn-primary ms-3',
  'toggle-description': 'btn btn- btn-sm  text-muted',
  'toggle-errors': 'btn btn- btn-sm text-muted',
  'add-item': 'btn btn-light btn-sm ms-auto',
  'language-toggle': 'btn-outline-secondary btn',
  'form-submit': 'btn-primary btn btn-lg float-end',
  'expand': 'btn btn-light',
  'remove-item': 'btn btn-outline-secondary btn-sm remove-item-button',
}

export const button = ({ inner, callback, cssClasses, context, isSubmit }: { 
  inner: any, callback: Function, cssClasses?: Array<string> , context: string, isSubmit?: boolean
}) => {
  if (!cssClasses) cssClasses = []

  if (cssClasses.includes('end'))
    cssClasses.push('float-end')

  if (context && buttonMapping[context]) {
    cssClasses.push(buttonMapping[context])
  }
  else {
    console.log(context)
  }
    

  return html`
    <button type=${isSubmit ? null : 'button'} onclick=${callback} class=${cssClasses.join(' ')}>
      ${inner}
    </button>
  `
}
