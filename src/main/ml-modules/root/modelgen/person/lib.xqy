xquery version "1.0-ml";

module namespace umles = "http://marklogic.com/rpaas/entity-services/entity-types/PersonModel-0.0.1";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare variable $PREFIX-RDFA := "";
declare variable $PREFIX-MAP := sem:prefixes($PREFIX-RDFA);
declare variable $PREFIXES := ("xs","xhtml","dcterms","og","atom","rdf","vcard","dbpedia-owl","owl","rss","geonames","foaf","doap","dbpedia","cc","product","rdfs","media","prov","result-set","skos","dc","void","wikidata");
declare variable $IRI-TYPE := sem:curie-expand("rdf:type");
declare variable $IRI-LABEL := sem:curie-expand("rdfs:label");


declare function umles:dynIRI($expr) as sem:iri* {
   if (not(exists($expr))) then ()
   else if (count($expr) gt 1) then for $t in $expr return umles:dynIRI($t)
   else
      let $type := string(xdmp:type($expr))
      return
        if ($type eq "iri" or $type eq "blank") then $expr
        else if ($type eq "string") then 
           let $iri := sem:iri($expr)
           let $_ := for $p in $PREFIXES return 
              if (starts-with($expr, concat($p, ":"))) then xdmp:set($iri, sem:curie-expand($expr, $PREFIX-MAP))
              else ()
           return $iri
        else fn:error(xs:QName("ERROR"), $expr || " " || $type)
};

declare function umles:addTriple($ret as json:array, $s, $p, $o) as empty-sequence() {
  if (not(exists($s)) or not(exists($p)) or not(exists($o))) then ()
  else for $oi in $o return json:array-push($ret, sem:triple($s, $p, $oi))   
};

declare function umles:setTriples_Concept($id as xs:string, $content as item()?, $headers as item()*, $ioptions as map:map) as sem:triple* {
  let $iri := umles:dynIRI(map:get($content, "id"))
  let $ret := json:array()
  return json:array-values($ret)
};
declare function umles:setTriples_Organization($id as xs:string, $content as item()?, $headers as item()*, $ioptions as map:map) as sem:triple* {
  let $iri := umles:dynIRI(map:get($content, "id"))
  let $ret := json:array()
  return json:array-values($ret)
};