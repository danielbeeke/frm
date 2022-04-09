import { init } from '../../src'
import { fetch } from '../test-utils/fetchMock'

init()

/** @ts-ignore */
window.fetch = fetch

describe('<frm-field />', () => {
  test('init', async () => {
    document.body.innerHTML = `<frm-field 
      shape="/shapes/ttl/schema.person.shacl.ttl"
      shapeSubject="schema:PersonShape"
      predicate="schema:givenName" />`
    
    console.log(document.body.innerHTML)
  })

})