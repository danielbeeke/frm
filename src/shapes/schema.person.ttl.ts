// See /shapes in the root of the project for the source files.

export default `
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

schema:examplePerson
  a schema:Person ;
  schema:address [
    a schema:PostalAddress ;
    schema:addressLocality "Colorado Springs"^^xsd:string ;
    schema:addressRegion "CO"^^xsd:string ;
    schema:postalCode "80840"^^xsd:string ;
    schema:streetAddress "100 Main Street"^^xsd:string
  ] ;
  # schema:abstract "eyJ0aW1lIjoxNjU4MjI0MTg3NDQ5LCJibG9ja3MiOlt7ImlkIjoiTzdieXp2T29DcSIsInR5cGUiOiJoZWFkZXIiLCJkYXRhIjp7InRleHQiOiJMb3JlbSBpcHN1bSIsImxldmVsIjoyfX0seyJpZCI6IkNBblMzZUIzeXYiLCJ0eXBlIjoicGFyYWdyYXBoIiwiZGF0YSI6eyJ0ZXh0IjoiVGhpcyBpcyBncmVhdCBtYW4uLi48YnI+In19XSwidmVyc2lvbiI6IjIuMjUuMCJ9" ;
  schema:alumniOf "Dartmouth"^^xsd:string ;
  schema:birthDate "1979-10-12"^^xsd:date ;
  schema:birthPlace "Philadelphia, PA"^^xsd:string ;
  schema:colleague <https://dbpedia.org/resource/S%C3%B8ren_Kierkegaard>, <https://danielbeeke.nl/#me> ;
  schema:email "info@example.com"^^xsd:string ;
  schema:gender "female"^^xsd:string ;
  schema:gender "female2"^^xsd:string ;
  schema:height "72 inches"^^xsd:string ;
  schema:image <http://njh.me/janedoe.jpg> ;
  schema:jobTitle "Research Assistant"^^xsd:string ;
  schema:memberOf "Republican Party"^^xsd:string ;
  schema:name "Jane Doe"^^xsd:string ;
  schema:nationality "Albanian"^^xsd:string ;
  schema:sameAs <https://www.facebook.com/>, <https://www.linkedin.com/>, <http://twitter.com/>, <http://instagram.com/>, <https://plus.google.com/> ;
  schema:telephone "(123) 456-6789"^^xsd:string ;
  schema:url <http://www.example.com> .
`