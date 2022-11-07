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

    sh:property [
        sh:path schema:name ;
        sh:name "Title"@en ;
        sh:name "Titel"@nl ;
        sh:datatype rdf:langString ;
        sh:minCount 1 ;
        sh:qualifiedMinCount 1 ;
        sh:qualifiedMaxCount 1 ;
        sh:qualifiedValueShape [
            sh:languageIn ( "en" )
        ] ;
        sh:uniqueLang true ;
    ] ;

    frm:element [
        sh:name "Identifier"@en ;
        sh:name "Identificatie"@nl ;
        frm:widget "frm-uri" ;
        frm:populateFrom schema:name ;
    ] ;

    sh:property [
        sh:name "Abstract"@en ;
        sh:name "Korte beschrijving"@nl ;
        sh:path schema:abstract ;
        sh:datatype rdf:langString ;
        sh:uniqueLang true ;
    ] ;

    sh:property [
        sh:group schema:Main ;
        sh:path schema:genre ;
    ] ;

    sh:property [
        sh:name "ISBN" ;
        sh:path schema:isbn ;
        sh:datatype xsd:string ;
        sh:maxCount 1 ;
    ] .
`