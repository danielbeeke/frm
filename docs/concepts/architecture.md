# FRM

FRM starts with a CustomElement: frm-form. Given the required input sich as a SHACL shape and some optional data it will render a form. An important step is understanding which fields to render and also how to group them. The flow is as follows:

- Import frm and start it with `init(yourConfig)`.
- frm will start and fetch the SHACL shape.
  - it will match every predicate with a widget (some widgets may have multiple predicates).
  - it will improve the SHACL properties with properties that are available such as labels from the ontology.
- Render a <frm-form> in the browser.
  - it will use ShapeToFields to group and render each depth of the form.