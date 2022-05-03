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
  search
}

export const icon = (name: keyof typeof iconMap) => 
  new Hole('html', [iconMap[name].replace('class="', 'class="icon ')] as unknown as TemplateStringsArray, [])
