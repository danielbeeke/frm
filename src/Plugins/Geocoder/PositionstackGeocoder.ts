import { UnifiedGeoSearch } from '../../types/UnifiedGeoSearch'
import { GeocoderBase } from './GeocoderBase'

export class PositionstackGeocoder extends GeocoderBase {

  private apiKey: string
  private useHttps: boolean
  private proxy: string

  constructor (apiKey: string, proxy: string = '', useHttps: boolean = false) {
    super()
    this.apiKey = apiKey
    this.useHttps = useHttps
    this.proxy = proxy
  }

  async search(searchTerm: string): Promise<UnifiedGeoSearch | void> {
    try {
      const response = await fetch(`${this.proxy}http${this.useHttps ? 's' : ''}://api.positionstack.com/v1/forward?access_key=${this.apiKey}&query=${searchTerm}`)
      const { data: [ item ] } = await response.json()
  
      const { locality, latitude, longitude, number, country, region, postal_code: postalCode, street } = item
  
      return {
        locality,
        latitude,
        longitude,
        number,
        region,
        country,
        postalCode,
        street
      }  
    }
    catch (exception) {
      console.log(exception)
    }
  }

}