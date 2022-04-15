import defaultConfig from '../src/defaultConfig'
import '../src/init'
import { init } from '../src/init'

defaultConfig.keys['positionstack'] = process.env.POSITIONSTACK

if (!defaultConfig.keys['positionstack']) {
  console.error(`Missing positionstack key. Please create a free account on https://positionstack.com if you want to see the go address demo.`)
}

init(defaultConfig)
