import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'

export interface WidgetsMatcherInterface {

  match(settings: Settings, ShapeDefinition: ShapeDefinition): Promise<void>

}