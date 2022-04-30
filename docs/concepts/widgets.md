# Widgets

Widgets are at the core of frm. It is very easy to create your own widgets and they will automatically be applied if a SHACL shape does not have frm:widget. See the widgets-matcher. 

A widget gets two main properties: data and definition. These two are both LDflex paths. Mutations also happne via the LDflex path to a N3 store.