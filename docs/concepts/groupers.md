# Groupers

Some widget are a combination of multiple predicates such as a geographical map for the latitude and longitude predicates. Groupers are applied even without configuration (just given a vanilla SHACL shape) and claim specific predicates on which they work. This results in very fine grained widgets working for specific cases such as a address field that works via autocomplete and a geocoder (A geocoder converts a loose typed address string to a strongly typed address string). 

At the moment there is another concept called __groups__, sorry for the current naming.