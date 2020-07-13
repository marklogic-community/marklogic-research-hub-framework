xquery version "1.0-ml";

(: old code for converting SKOS triples to the MarkLogic EntityEnrichment dictionary form.
   NOTE: this is not currently used, because it is fairly slow to update a large dictionary.
   instead, the research hub uses reverse queries to drive text enrichment using names and identifiers of entities.
   
   This code should therefore generally be ignored, but is included for reference
   :)
module namespace dict = "http://marklogic.com/rpaas/lib/dictionary-utils";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
import module namespace vfu = "http://marklogic.com/ohdsi/omopcdm/vocabulary/lib/vocab-flow-utils" at "/lib/vocab-flow-utils.xqy";
declare namespace entity="http://marklogic.com/entity";

declare variable $dict:DICTIONARYPATH := "/data/rpaas/dictionary/";
declare variable $dict:OHDSI-CONCEPT-BASE-IRI := fn:concat($vfu:vocab, "concept#");
declare variable $dict:RPAAS-CONCEPT-SCHEMES-BASE-IRI := "http://marklogic.com/rpaas/conceptScheme#";
declare variable $dict:RPAAS-CONCEPT-SCHEMES-XML := "/data/rpaas/concept-schemes/concept-schemes.xml";

declare function dict:conversion-maps() {
  (: convert the concept schemes xml skos:prefLabel entries into a conversion map for entity:enrich :)
  let $concept-pairs :=
    fn:distinct-values(
        doc($dict:RPAAS-CONCEPT-SCHEMES-XML)/sem:triples/sem:triple[sem:predicate eq "http://www.w3.org/2004/02/skos/core#prefLabel"] !
        (fn:substring-after(./sem:subject/fn:string(), "#") || "|" || fn:lower-case(fn:replace(./sem:object/fn:string(), "[\s/]+", "-")))
    )

  let $entity-map := map:new(
    map:entry('', xs:QName("entity:entity"))
  )
  let $_build :=
    for $pair in $concept-pairs
    let $t := fn:tokenize($pair, "\|")
    return
      map:put($entity-map, $t[1], xs:QName( fn:concat("entity:", $t[2]) ))

  return $entity-map
};

declare function dict:conversion-maps-json() {
  xdmp:to-json( dict:conversion-maps() )
};

declare function dict:dictionary-name($vocab) {
  fn:concat($dict:DICTIONARYPATH, $vocab, "-remove-overlaps")
};