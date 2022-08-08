import defaultConfig from '../src/defaultConfig'
import { init } from '../src/init'
import { render, html } from '../src/helpers/uhtml'

import { PositionstackGeocoder } from '../src/Plugins/Geocoder/PositionstackGeocoder'
import { Internationalization } from '../src/core/Internationalization'

const formId = location.pathname.substring(1)

const forms = {
  person: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/schema.person.shacl.ttl#schema:PersonShape'
  },
  ['person-empty']: {
    data: null,
    shape: '/shapes/ttl/schema.person.shacl.ttl#schema:PersonShape',
    extraSettings: {},
  },
  person2: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/schema.person2.shacl.ttl#ex:PersonShape',
    extraSettings: {},
  },
  reference: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/reference.shacl.ttl#schema:PersonShape',
    extraSettings: {},
  },
  sidebar: {
    data: '/shapes/ttl/schema.person.ttl#schema:examplePerson',
    shape: '/shapes/ttl/sidebar.shacl.ttl#schema:PersonShape',
    extraSettings: {}
  },
  ebook: {
    data: null,
    shape: '/shapes/ttl/ebook.shacl.ttl#frm:Ebook',
    extraSettings: {
      internationalization: new Internationalization({
        allowCreation: true,
        langCodes: ['en', 'nl']
      })
    }
  },
}

if (forms[formId]) {
  defaultConfig.geocoder = new PositionstackGeocoder(process.env.POSITIONSTACK)
  defaultConfig.internationalization = new Internationalization({
    allowCreation: true
  }),
  defaultConfig.proxy = 'http://localhost:1234/cors/'
  const { data, shape, extraSettings } = forms[formId]
  
  Object.assign(defaultConfig, extraSettings)

  init(defaultConfig)
  
  render(document.body, html`
  <frm-form 
    onsubmit=${(event) => {
      console.log(event.detail)
    }}
    class=${`container-sm d-block col-8 ${formId}`}
    data="${data}" 
    shape="${shape}" debug />
  `)
}
else {
  render(document.body, html`
  <div class="container-sm d-block col-8 d-flex flex-column">
    ${Object.keys(forms).map((name) => html`<a href=${`/${name}`}>${name}</a>`)}
  </div>
  `)
}
