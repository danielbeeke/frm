import defaultConfig from '../src/defaultConfig'
import '../src/init'
import { init } from '../src/init'
import { PositionstackGeocoder } from '../src/Plugins/Geocoder/PositionstackGeocoder'
import { Internationalization } from '../src/core/Internationalization'

defaultConfig.geocoder = new PositionstackGeocoder(process.env.POSITIONSTACK)
defaultConfig.internationalization = new Internationalization(['en', 'fr', 'nl'], 'mixed'),
defaultConfig.proxy = 'http://localhost:1234/cors/'

init(defaultConfig)
