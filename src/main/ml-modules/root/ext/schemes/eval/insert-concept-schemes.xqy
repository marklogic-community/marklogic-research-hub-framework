(:
  Insert the concept schemes into the database
:)
xquery version "1.0-ml";

import module namespace dict = "http://marklogic.com/rpaas/lib/dictionary-utils" at "/lib/dictionary-utils.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

let $_log := xdmp:log("Insert the concept schemes into the database")
let $construct-sparql := fn:concat('
  prefix skos: <http://www.w3.org/2004/02/skos/core#>
  prefix concept: <',
    $dict:OHDSI-CONCEPT-BASE-IRI,
    '>

  CONSTRUCT {
    ?conceptScheme a skos:ConceptScheme;
                   skos:prefLabel ?domain .
  } WHERE {
    ?id concept:domain ?domain .
    BIND (iri(concat("',
      $dict:RPAAS-CONCEPT-SCHEMES-BASE-IRI,
      '", lcase(replace(?domain, "[\\s/]", "", "i")))) AS ?conceptScheme)
  }
')
let $_debug-log := xdmp:log($construct-sparql, "debug")
let $triples := sem:sparql($construct-sparql)
return (
    xdmp:document-insert(
        $dict:RPAAS-CONCEPT-SCHEMES-XML,
        <sem:triples>{$triples}</sem:triples>,
        <options xmlns="xdmp:document-insert">
            <permissions>{xdmp:default-permissions()}</permissions>
            <collections>
                <collection>http://marklogic.com/xdmp/documents</collection>
            </collections>
        </options>
    ),
    xdmp:log("Concept schemes inserted into the database")
)
