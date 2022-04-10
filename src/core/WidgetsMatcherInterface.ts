import { LDflexPath } from '../types/LDflexPath'
import { Settings } from '../types/Settings'

export interface WidgetsMatcherInterface {

  match(settings: Settings, shape: LDflexPath): Promise<void>

}