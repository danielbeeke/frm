import { UnifiedGeoSearch } from '../../types/UnifiedGeoSearch'

export abstract class GeocoderBase {

  abstract search (searchTerm: string): Promise<UnifiedGeoSearch | void>

}