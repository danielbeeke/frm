// See /shapes in the root of the project for the source files.

export default `
@prefix dash: <http://datashapes.org/dash#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix html: <http://www.w3.org/1999/xhtml/> .
@prefix frm: <http://frm.danielbeeke.nl/ontology#> .

frm:Ebook
    a sh:NodeShape ;

    sh:targetClass schema:Book ;
    sh:pattern "^http://frm.danielbeeke.nl/data/" ;

    frm:element [
        frm:widget "frm-language-tabs" ;
    ] ;

    frm:element [
        frm:widget "frm-uri" ;
    ] ;

    sh:property [
        sh:path schema:name ;
        sh:datatype rdf:langString ;
        sh:minCount 1 ;
        sh:qualifiedMinCount 1 ;
        sh:qualifiedMaxCount 1 ;
        sh:qualifiedValueShape [
            sh:languageIn ( "en" )
        ] ;
        sh:uniqueLang true ;
    ] .
`