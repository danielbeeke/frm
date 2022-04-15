import info from 'bundle-text:bootstrap-icons/icons/info.svg'
import x from 'bundle-text:bootstrap-icons/icons/x.svg'
import { Hole } from 'uhtml'

const iconMap = {
  info,
  x,
}

export const icon = (name: keyof typeof iconMap) => {

  return new Hole('html', [iconMap[name].replace('class="', 'class="icon ')] as unknown as TemplateStringsArray, [])
}