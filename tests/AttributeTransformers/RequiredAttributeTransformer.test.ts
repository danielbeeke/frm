import { RequiredAttributeTransformer } from '../../src/AttributeTransformers/RequiredAttributeTransformer'
import { ShapeDefinition } from '../../src/core/ShapeDefinition'
import PersonShacl from '../../src/shapes/schema.person.shacl.ttl'
import Person from '../../src/shapes/schema.person.ttl'
import { rdfToLDflex } from '../../src/helpers/rdfToLDflex'
import defaultConfig from '../../src/defaultConfig'

describe('required attribute transformer', () => {
  test('transforms', async () => {
    const shapeDefinition = await new ShapeDefinition(defaultConfig, PersonShacl, 'schema:PersonShape')
    const person = await rdfToLDflex(Person, 'schema:examplePerson')
    const givenNamePredicate = await shapeDefinition.get('schema:givenName')
    const transformer = new RequiredAttributeTransformer()
    const attributeText = await transformer.transform(person, givenNamePredicate)
    expect(attributeText).toBe('required')
  });  
})
