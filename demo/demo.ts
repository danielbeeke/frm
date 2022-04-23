import defaultConfig from '../src/defaultConfig'
import '../src/init'
import { init } from '../src/init'
import { PositionstackGeocoder } from '../src/Plugins/Geocoder/PositionstackGeocoder'

defaultConfig.geocoder = new PositionstackGeocoder(process.env.POSITIONSTACK)

init(defaultConfig)
