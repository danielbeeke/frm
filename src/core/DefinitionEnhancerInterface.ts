import { Settings } from '../types/Settings'
import { ShapeDefinition } from './ShapeDefinition'

export interface DefinitionEnhancerInterface {
  enhance: (settings: Settings, ShapeDefinition: ShapeDefinition) => Promise<void>
}