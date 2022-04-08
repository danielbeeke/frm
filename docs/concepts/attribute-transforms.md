# Attribute transformers

An AttributeTransformer is a class responsible for taking input from various sources (data and form / field definition) and convert that to a correct HTML attribute.
All attributes that apply to a `<input />` are possible and maybe more.

This AttributeTransformer is loaded onto the backbone in the following way:

```
class RequiredAttributeTransformer implements AttributeTransformerInterface { ... }
const backbone = {
  ...
  attributeTransformers: {
    required: new RequiredAttributeTransformer()
  }
  ...
}
```

All AttributeTransformers are called when rendering a field. The AttributeTransformers can be added such as:

```
const transformedAttributes = backbone.attributeTransformers.map(t => t.transform(form, field))

return html`
  <input ...transformedAttributes />
`
```