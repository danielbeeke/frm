import { ShapeDefinition } from '../../src/core/ShapeDefinition'
import PersonShacl from '../../src/shapes/schema.person.shacl.ttl'

const shapeDefinition = new ShapeDefinition(PersonShacl, 'schema:PersonShape')

describe('ShapeDefinition', () => {

  test('it loads a shape definition', async () => {    
    expect(typeof shapeDefinition).toBe('object');
    expect(shapeDefinition instanceof ShapeDefinition).toBeTruthy()
  });  
  test('it loads a predicate definition', async () => {
    const genderPredicate = await shapeDefinition.get('schema:gender')
    const inItems = await genderPredicate['sh:in'].list()
    expect(inItems.map(item => item.value)).toEqual(['female', 'male']);
  });  
})
