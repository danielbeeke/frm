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

schema:PersonShape
    a sh:NodeShape ;

    frm:element [
        sh:group schema:TopGroup ;
    	# rdfs:label "Language"@en ;
        frm:widget "frm-language-tabs" ;
    ] ;

    sh:targetClass schema:Person ;
    sh:property [
        sh:group schema:NameGroup ;
        sh:path schema:givenName ;
        sh:order 1 ;
        sh:or ( [ sh:datatype xsd:string ] [ sh:datatype <http://www.w3.org/1999/02/22-rdf-syntax-ns#langString> ] ) ;
        sh:name "given name"@en ;
        sh:name "Gegeven name"@nl ;
        sh:minCount 1 ;
        sh:maxCount 3 ;
    ] ;

    sh:property [
        sh:group schema:NameGroup ;
        sh:path schema:familyName ;
        sh:order 2 ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
    ] ;


    sh:property [
        sh:path schema:callSign ;
        sh:order 2 ;
        sh:datatype <http://www.w3.org/1999/02/22-rdf-syntax-ns#langString> ;
        sh:minCount 1 ;
    ] ;


    sh:property [
        sh:path schema:description ;
        sh:order 2 ;
        frm:widget "editor" ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
    ] ;

    sh:property [
        sh:path schema:abstract ;
        sh:order 2 ;
        frm:widget "plain-text" ;
        sh:datatype xsd:string ;
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
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:address ;
        sh:node schema:AddressShape ;
    ] .

schema:TopGroup
	a sh:PropertyGroup ;
	sh:order 1 ;
	# rdfs:label "Top"@en ;
    html:class "top-container" .

schema:NameGroup
	a sh:PropertyGroup ;
	sh:order 2 ;
	# rdfs:label "Name"@en ;
    html:class "name-container" .

schema:AddressShape
    a sh:NodeShape ;
    sh:targetClass schema:PostalAddress ;
    sh:closed true ;
    sh:property [
        sh:path schema:streetAddress ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:addressRegion ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:addressLocality ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:postalCode ;
        sh:or ( [ sh:datatype xsd:string ] [ sh:datatype xsd:integer ] ) ;
        sh:minInclusive 1000 ;
        sh:maxInclusive 99999 ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path schema:addressCountry ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] .
`