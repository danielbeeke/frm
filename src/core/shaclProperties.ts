/**
 * @see https://www.w3.org/TR/shacl/
 */
export const ValueTypeConstraints = ['sh:class', 'sh:datatype', 'sh:nodeKind']
export const CardinalityConstraints = ['sh:minCount', 'sh:maxCount']
export const ValueRangeConstraints = ['sh:minExclusive', 'sh:maxExclusive', 'sh:minInclusive', 'sh:maxInclusive']
export const StringBasedConstraints = ['sh:minLength', 'sh:maxLength', 'sh:pattern', 'sh:languageIn', 'sh:uniqueLang']
export const PropertyPairConstraints = ['sh:equals', 'sh:disjoint', 'sh:lessThan', 'sh:lessThanOrEquals']
export const LogicalConstraints = ['sh:not', 'sh:and', 'sh:or', 'sh:xone']
export const ShapeBasedConstraints = ['sh:node', 'sh:property', 'sh:qualifiedValueShape', 'sh:qualifiedMinCount', 'sh:qualifiedMaxCount']
export const OtherConstraints = ['sh:closed', 'sh:ignoredProperties', 'sh:hasValue', 'sh:in']