import info from 'bundle-text:bootstrap-icons/icons/info.svg'
import x from 'bundle-text:bootstrap-icons/icons/x.svg'
import plus from 'bundle-text:bootstrap-icons/icons/plus.svg'
import translate from 'bundle-text:bootstrap-icons/icons/translate.svg'
import exclamationTriangleFill from 'bundle-text:bootstrap-icons/icons/exclamation-triangle-fill.svg'
import gearFill from 'bundle-text:bootstrap-icons/icons/gear-fill.svg'
import search from 'bundle-text:bootstrap-icons/icons/search.svg'

import { Hole } from 'uhtml'

const iconMap = {
  info,
  x,
  plus,
  translate,
  exclamationTriangleFill,
  gearFill,
  search,
  loading: (color: string) => `<svg width="38" height="38" class="" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
              <stop stop-color="${color}" stop-opacity="0" offset="0%"/>
              <stop stop-color="${color}" stop-opacity=".631" offset="63.146%"/>
              <stop stop-color="${color}" offset="100%"/>
          </linearGradient>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)">
              <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)" stroke-width="2">
                  <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="0.9s"
                      repeatCount="indefinite" />
              </path>
              <circle fill="${color}" cx="36" cy="18" r="1">
                  <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="0.9s"
                      repeatCount="indefinite" />
              </circle>
          </g>
      </g>
    </svg>
  `
}

export const icon = (name: keyof typeof iconMap, color: string = 'black') => {
  const item = iconMap[name]
  const iconString = typeof item === 'string' ? item : item(color)
  return new Hole('html', [iconString.replace('class="', 'class="icon ')] as unknown as TemplateStringsArray, [])
}

