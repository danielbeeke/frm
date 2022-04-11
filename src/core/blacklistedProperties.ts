/**
 * Some properties in the different namespace collide.
 * This blacklisting is for the developer.
 * TODO, use this list to throw exceptions for the developer while developing.
 */
export default {
  'html:required': 'You should use sh:minCount and sh:maxCount instead. Shacl does not understand html:required and it is not possible to translate html:required to sh:minCount',
  'html:minLength': 'Use sh:minLength it will be translated and Shacl validation will work',
  'html:maxLength': 'Use sh:maxLength it will be translated and Shacl validation will work',
}