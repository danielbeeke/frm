import { init as initFrmField } from './CustomElements/FrmField'
import defaultConfig from './defaultConfig'
import { Settings } from './types/Settings'

export const init = (settings: Settings | null = null) => {
  if (!settings) settings = defaultConfig
  initFrmField(settings)
}