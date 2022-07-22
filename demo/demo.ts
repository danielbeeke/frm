import defaultConfig from '../src/defaultConfig'
import { init } from '../src/init'
import { PositionstackGeocoder } from '../src/Plugins/Geocoder/PositionstackGeocoder'
import { Internationalization } from '../src/core/Internationalization'

defaultConfig.geocoder = new PositionstackGeocoder(process.env.POSITIONSTACK)
defaultConfig.internationalization = new Internationalization({
  mode: 'tabs',
  allowCreation: true
}),
defaultConfig.proxy = 'http://localhost:1234/cors/'

init(defaultConfig)

const formId = location.pathname.substring(1)

const forms = {
  person: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/schema.person.shacl.ttl#schema:PersonShape'
  },
  person2: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/schema.person2.shacl.ttl#ex:PersonShape'
  }
}

if (forms[formId]) {
  const { data, shape } = forms[formId]

  document.body.innerHTML = `
  <frm-form 
    class="container-sm d-block col-8"
    data="${data}" 
    shape="${shape}" debug />
  `
}
else {
  document.body.innerHTML = `
  <div class="container-sm d-block col-8 d-flex flex-column">
    <a href="/person">Person</a>
    <a href="/person2">Person 2</a>
  </div>
  `
}
