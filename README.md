# FRM

Frm is a RDF form builder based on SHACL shapes.
It is a next iteration of thoughts and concepts used in [rdf-form](https://github.com/danielbeeke/rdf-form).
The product is unfinished and it is currently worked on.

The main differences are:

- Uses SHACL as a base language to define forms
- Uses LDflex as an abstraction for accesing the form definition and the form data
- High focus on extensibility, a settings file where you can plug in and swap widgets, geocoders, and base classes
- Multilingualism works according to RDF spec, in rdf-form there were some hacks

There is some documentation in the docs folder.

To see it for yourself:

- `npm install`
- `npm run demo`

![screenshot of a form made with FRM](https://github.com/danielbeeke/frm/blob/main/assets/frm.png?raw=true)