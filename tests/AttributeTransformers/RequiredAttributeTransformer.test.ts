import { RequiredAttributeTransformer } from '../../src/AttributeTransformers/RequiredAttributeTransformer'
import { ShapeDefinition } from '../../src/core/ShapeDefinition'
import PersonShacl from '../../src/shapes/schema.person.shacl.ttl'
import Person from '../../src/shapes/schema.person.ttl'
import { turtleToLDflex } from '../../src/helpers/turtleToLDflex'

const shapeDefinition = new ShapeDefinition(PersonShacl, 'schema:PersonShape')

describe('required attribute transformer', () => {
  test('transforms', async () => {
    const person = await turtleToLDflex(Person, 'schema:examplePerson')
    const givenNamePredicate = await shapeDefinition.get('schema:givenName')
    const transformer = new RequiredAttributeTransformer()
    const attributeText = await transformer.transform(person, givenNamePredicate)
    expect(attributeText).toBe('required')
  });  
})
