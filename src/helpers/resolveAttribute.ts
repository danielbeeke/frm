const attributeCache = new Map()

/**
 * Given a property, will expand until it finds texts instead of a URI.
 */
export const resolveAttribute = async (element, attribute: string, required: boolean = false) => {
  const attributeValue = element.getAttribute(attribute)!
  if (attributeValue && !attributeCache.has(attributeValue)) {
    if (required && !attributeValue) throw new Error(`Missing HTML attribute: ${attribute}`)

    if (!['https', 'http', 'blob', '/'].some(protocol => attributeValue.startsWith(protocol))) return attributeValue
  
    const response = await fetch(attributeValue)
    const result = response.text()
    attributeCache.set(attributeValue, result)
  }

  return attributeCache.get(attributeValue)
}