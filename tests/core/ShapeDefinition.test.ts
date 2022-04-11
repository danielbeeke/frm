import { ShapeDefinition } from '../../src/core/ShapeDefinition'
import PersonShacl from '../../src/shapes/schema.person.shacl.ttl'
import defaultConfig from '../../src/defaultConfig'

describe('ShapeDefinition', () => {
  let shapeDefinition

  test('it loads a shape definition', async () => {    
    shapeDefinition = await new ShapeDefinition(defaultConfig, PersonShacl, 'schema:PersonShape')
    expect(typeof shapeDefinition).toBe('object');
    expect(shapeDefinition instanceof ShapeDefinition).toBeTruthy()
  });  

  test('it loads a predicate definition', async () => {
    const genderPredicate = shapeDefinition.get('schema:gender')
    const inItems = await genderPredicate['sh:in'].list()
    expect(inItems.map(item => item.value)).toEqual(['female', 'male']);
  });  
})
