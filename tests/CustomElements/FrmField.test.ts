import '../../src'
import { fetch } from '../test-utils/fetchMock'

/** @ts-ignore */
window.fetch = fetch

describe('<frm-field />', () => {
  test('init', (done) => {
    document.body.innerHTML = `<frm-field shape="/shapes/ttl/schema.person.shacl.ttl" shapeSubject="schema:PersonShape" predicate="schema:givenName" />`

    setTimeout(() => {
      console.log(document.body.innerHTML)
      expect(document.body.innerHTML).toContain('<frm-field class="" widget="string">')
      done()
    }, 1500)
  })

})