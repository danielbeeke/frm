import '../../src'
import { fetch } from '../test-utils/fetchMock'

/** @ts-ignore */
window.fetch = fetch

describe('<frm-field />', () => {
  test('init', async () => {
    document.body.innerHTML = `<frm-field 
      shape="/shapes/ttl/schema.person.shacl.ttl"
      shapeSubject="schema:PersonShape"
      predicate="schema:givenName" />`

    setTimeout(() => {
      console.log(document.body.innerHTML)
    }, 5000)
  })

})