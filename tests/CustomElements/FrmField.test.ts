import '../../src'
import { fetch } from '../test-utils/fetchMock'

/** @ts-ignore */
window.fetch = fetch

describe('<frm-field />', () => {
  test('init', (done) => {
    document.body.innerHTML = `<frm-field 
      shape="/shapes/ttl/schema.person.shacl.ttl"
      shapeSubject="schema:PersonShape"
      predicate="schema:givenName" />`

    setTimeout(() => {
      expect(document.body.innerHTML).toBe('<frm-field shape="/shapes/ttl/schema.person.shacl.ttl" shapesubject="schema:PersonShape" predicate="schema:givenName" widget="string"></frm-field>')
      done()
    }, 1500)
  })

})