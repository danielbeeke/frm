// See /shapes in the root of the project for the source files.

export default `
@prefix dash: <http://datashapes.org/dash#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

schema:PersonShape
    a sh:NodeShape ;
    sh:targetClass schema:Person ;
    sh:property [
        sh:path schema:givenName ;
        sh:datatype xsd:string ;
        sh:name "given name"@en ;
        sh:name "Gegeven name"@nl ;
        sh:minCount 1 ;
    ] ;
    sh:property [
        sh:path schema:birthDate ;
        sh:datatype xsd:date ;
        sh:lessThan schema:deathDate ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:gender ;
        sh:in ( "female" "male" ) ;
    ] ;
    sh:property [
        sh:path schema:address ;
        sh:node schema:AddressShape ;
    ] .

schema:AddressShape
    a sh:NodeShape ;
    sh:targetClass schema:PostalAddress ;
    sh:closed true ;
    sh:property [
        sh:path schema:streetAddress ;
        sh:datatype xsd:string ;
    ] ;
    sh:property [
        sh:path schema:addressRegion ;
        sh:datatype xsd:string ;
    ] ;
    sh:property [
        sh:path schema:addressLocality ;
        sh:datatype xsd:string ;
    ] ;
    sh:property [
        sh:path schema:postalCode ;
        sh:or ( [ sh:datatype xsd:string ] [ sh:datatype xsd:integer ] ) ;
        sh:minInclusive 10000 ;
        sh:maxInclusive 99999 ;
    ] ;
    sh:property [
        sh:path schema:addressCountry ;
        sh:datatype xsd:string ;
    ] .
`