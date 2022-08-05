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
        frm:widget "frm-language-tabs" ;
    ] ;

    sh:property [
        sh:path schema:colleague ;
        frm:source "https://dbpedia.org/sparql" ;
        frm:query """
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dbo:  <http://dbpedia.org/ontology/>
            PREFIX bif: <bif:>

            SELECT DISTINCT ?uri (SAMPLE(?label) AS ?label) (SAMPLE(?image) AS ?image) {
                ?uri rdfs:label ?label .
                ?label bif:contains "'SEARCH_TERM'" .
                ?uri rdf:type dbo:Person .
                OPTIONAL { 
                    ?uri dbo:thumbnail ?image .
                }
            }
            GROUP BY ?uri
            LIMIT 10
        """ ;
    ] .

`