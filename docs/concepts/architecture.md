# FRM

FRM starts with a CustomElement: frm-form. Given the required input such as a SHACL shape and some optional data it will render a form. An important step is understanding which fields to render and also how to group them. The flow is as follows:

- Import frm and start it with `init(yourConfig)`.
- Use `<frm-form />` with `shape` and optional `data` attributes.
- frm will start and fetch the SHACL shape.
- it will match every predicate with a widget (some widgets may have multiple predicates).
- it will improve the SHACL properties with properties that are available such as labels from the ontology.
- it will use ShapeToFields to group and render each depth of the form.
- Now there will be a HTML tree containing various customElements from `src/CustomElements`.
- frm-field will load the specified (or added by the enhancing step) widget from `src/Widgets`.

Form definition is given to each Widget via this.definition. The definition is a LDflex path.
Form data is given to each Widget via this.values. The values are a LDflex path.

This means that those two paths also have a N3 store to back them.
This makes some steps a breeze to do such a counting the languages or other things, because within the store you have a flattened tree of quads.