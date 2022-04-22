import defaultConfig from '../src/defaultConfig'
import '../src/init'
import { init } from '../src/init'

defaultConfig.keys['positionstack'] = process.env.POSITIONSTACK

init(defaultConfig)
