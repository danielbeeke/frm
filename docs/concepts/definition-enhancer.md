# The Definition Enhancer

When a pure SHACL shape is given it might lack some labels or other properties. For some of these properties we can deduce them from other properties or things inside the context. The definition enhancer does do such logic. It is possible to give your own version or build on top of it. 

Implement enhancements

- Information from the ontology is fetched and cached
- Datatype is set for SHACL property that only have sh:in
- sh:maxCOunt is set to Infinity if it is not given

It might be interesting to modularize these.