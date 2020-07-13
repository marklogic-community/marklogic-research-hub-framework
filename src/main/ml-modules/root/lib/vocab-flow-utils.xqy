xquery version "1.0-ml";

module namespace vfu = "http://marklogic.com/ohdsi/omopcdm/vocabulary/lib/vocab-flow-utils";

import module namespace mem = "http://xqdev.com/in-mem-update" at "/MarkLogic/appservices/utils/in-mem-update.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace av = "http://athena.ohdsi.org/vocabulary";

(: gradle custom options prefix :)
declare variable $vfu:DATAHUB-INJECTED-PARAM-PREFIX := "dhf.";

declare variable $vfu:VOCAB-BATCH-COLLNAMES-KEY  := $vfu:DATAHUB-INJECTED-PARAM-PREFIX || "aux-vocab-batch-tags";

declare variable $vfu:vocab := "http://marklogic.com/ohdsi/omopcdm/vocabulary/";

(: predicate prefix for relationships from cdm :)
declare variable $vfu:vocab-rel := fn:concat($vfu:vocab, "relationship#");

(:specific predicates :)
declare variable $vfu:vocab-concept-class := fn:concat($vfu:vocab, "concept#class");
declare variable $vfu:vocab-concept-domain := fn:concat($vfu:vocab, "concept#domain");
declare variable $vfu:vocab-concept-vocab := fn:concat($vfu:vocab, "concept#vocabulary");
declare variable $vfu:vocab-concept-id := fn:concat($vfu:vocab, "concept#hasId");
declare variable $vfu:prov := "http://www.w3.org/ns/prov#";

declare function vfu:has-value($node as node()*) as xs:boolean {
  
  if (fn:empty($node)) then
    fn:false()
  else
    (: Change to use fn:string() rather than text() :)
    if ((fn:string($node)) and (fn:string-length(fn:normalize-space(fn:string($node))) > 0)) then
      fn:true()
    else
      fn:false()

};

declare function vfu:get-as-non-empty-str($node as node()?) as xs:string? {
  if (vfu:has-value($node)) then
    fn:string($node)
  else
    ()
};

declare function vfu:get-map-val-as-non-empty-str(
$map as map:map*,
$map-key-as-node as node()?) as xs:string? {
  if (vfu:has-value($map-key-as-node)) then
    let $key := fn:string($map-key-as-node)
    return
      map:get($map, $key)
  else
    ()
};

declare function vfu:remove-empty-elements($element as element()) as element()? {
  if ($element/* or $element/text())
  then
    element {node-name($element)}
    {
      $element/@*,
      for $child in $element/node()
      return
        if ($child instance of element())
        then
          vfu:remove-empty-elements($child)
        else
          $child
    }
  else
    ()
};

declare function vfu:node-to-unsignedLong($node as node()* ) as xs:anyAtomicType* {

  let $str := vfu:get-as-non-empty-str($node)
  return
    vfu:str-to-unsignedLong($str)

};

declare function vfu:str-to-unsignedLong( $str as xs:string* ) as xs:anyAtomicType* {
  
  if (fn:empty($str)) then
    -1
  else
    try 
    {
      xs:unsignedLong($str)

    }
    catch ($err) {
      -1
    }

};

declare function vfu:get-date-from-node($node as node()*, $date-pic as xs:string, $date-default as xs:date*) as xs:date* {
  
  let $date-str := $node
  let $date-time :=
  if (vfu:has-value($date-str)) then
    xs:date(xdmp:parse-dateTime($date-pic, $date-str))
  else
    $date-default
  
  let $date := functx:date(fn:year-from-date($date-time),
                           fn:month-from-date($date-time),
                           fn:day-from-date($date-time))
  return
    $date

};

declare function vfu:get-aux-batch-coll-tags($options as map:map) as xs:string* {

  (: Additional collections that are injected for operational tracking :)
  let $batch-tags := map:get($options, $vfu:VOCAB-BATCH-COLLNAMES-KEY)
  return
    if (fn:count($batch-tags) > 0) then
      fn:tokenize($batch-tags, ",")
    else
      ()
};

declare function vfu:get-provider-dataset-coll($options as map:map) as xs:string* {

  (: provider example: "athena" :)
  let $provider := map:get($options, "dhf.provider") 
  
  (: dataset example: "cdmv5.1" :)
  let $dataset := map:get($options, "dhf.dataset")

  return ("provider-" || $provider, "dataset-" || $dataset)
  
};

declare function vfu:get-final-vocab-colls($id as xs:string,
                                            $options as map:map) as xs:string* {
  
  
  
  
  (: Auxiliary collections that are injected for operational tracking :)
    
  (vfu:get-provider-dataset-coll($options),
    "entity-concept",
    vfu:get-vocab-and-domain-colls($options, $id),
    vfu:get-aux-batch-coll-tags($options))

};  

declare function vfu:get-final-mgd-triple-colls(
                                            $final-uri as xs:string,
                                            $options as map:map) as xs:string* {
           
  (vfu:get-provider-dataset-coll($options),
          "managed-triples-for-concept",
          vfu:get-aux-batch-coll-tags($options))

}; 

declare function vfu:get-vocab-and-domain-colls($options as map:map,
$id as xs:string) as xs:string* {
  let $domain-coll :=
    let $map-domain := 
      if (map:contains($options, "domain")) then
        map:get($options, "domain")
      else
        map:map()
        
    return 
      if (map:contains($map-domain, $id)) then        
        fn:concat("domain-", map:get($map-domain, $id))
      else        
        "domain-Unspecified"
    
  let $vocab-coll :=
    let $map-vocabulary := 
      if (map:contains($options, "vocabulary")) then
        map:get($options, "vocabulary")
      else
        map:map()
        
    return 
      if (map:contains($map-vocabulary, $id)) then        
        fn:concat("vocabulary-", map:get($map-vocabulary, $id))
      else        
        "vocabulary-Unspecified"
          
  return ($domain-coll, $vocab-coll)
};

declare function vfu:get-final-perms($id as xs:string) as item()* {

  (: inherit permissions from STAGING to FINAL :)
  let $staging-doc-perms := xdmp:document-get-permissions($id)
  
  return
    if (fn:empty($staging-doc-perms)) then
      (xdmp:permission("rest-reader", "read"),
      xdmp:permission("rest-writer", "update"))
    else
      $staging-doc-perms
};

declare function vfu:get-iri-for-common-prefix($common-prefix as xs:string, $leaf as xs:string, $remove-brackets as xs:boolean) as xs:string* {
  let $prefixes := sem:prefixes("")
  let $predicate := sem:curie-expand(fn:concat($common-prefix, ":", $leaf), $prefixes)
  let $predicate :=
  if ($remove-brackets) then
    fn:replace($predicate, "[<>]", "")
  else
    $predicate
  
  return
    $predicate
};

declare function vfu:get-concept-syn-triples(
  $concept-id as xs:unsignedLong*,
  $concept-content-body as node()*, 
  $synonym-nodes as node()*, 
  $map-rel-id-to-nodes as map:map,
  $final-uri as xs:string) as sem:triple* {
  
  let $concept-name := fn:string($concept-content-body/*:concept_name)
  
  let $predicate := vfu:get-iri-for-common-prefix("skos", "altLabel", fn:true())
  
  for $synonym-node in $synonym-nodes
  let $variant := fn:string($synonym-node/*:concept_synonym_name)
  return
    if ($variant ne $concept-name) then
      sem:triple(<sem:triple
        xmlns:sem="http://marklogic.com/semantics">
        <sem:subject>{$final-uri}</sem:subject>
        <sem:predicate>{$predicate}</sem:predicate>
        <sem:object
          datatype="http://www.w3.org/2001/XMLSchema#string"
          xml:lang="en">{$variant}</sem:object>
      </sem:triple>)
    else
      ()

};

declare function vfu:get-rel-predicate-form($rel-id, $map-rel-id-to-nodes) as xs:string {
  let $rel-node := map:get($map-rel-id-to-nodes, $rel-id)
  return
    fn:concat($vfu:vocab-rel, $rel-node/*:relationship_concept_id, "_", fn:replace(fn:string($rel-node/*:relationship_id), "\s", "_"))
};

declare function vfu:get-concept-final-uri(
  $concept-id as xs:string*, 
  $provider as xs:string, 
  $dataset as xs:string,
  $is-version-agnostic as xs:boolean) as xs:string {
    if ($is-version-agnostic eq fn:true()) then
      "/concept/" || $provider || "/cdm/" || $concept-id || ".xml"
    else
      "/concept/" || $provider || "/" || $dataset || "/" || $concept-id || ".xml"
};

(:
To consider for mapping

Concept replaced by
Concept replaces

Concept same_as from
Concept same_as to

ICD9P replaced by
ICD9P replaces

LOINC replaced by
LOINC replaces

RxNorm replaced by
RxNorm replaces

Subsumes

UCUM replaced by
UCUM replaces
:)
declare function vfu:get-concept-rel-triples($concept-id as xs:unsignedLong*, 
  $concept-content-body as node()*, 
  $cr-nodes as node()*, 
  $map-rel-id-to-nodes as map:map,
  $final-uri as xs:string,
  $provider as xs:string,
  $dataset as xs:string,
  $is-version-agnostic as xs:boolean) as sem:triple* {
  
  let $skos-related := vfu:get-iri-for-common-prefix("skos", "related", fn:true())
  
  (: Now process each relationship and generate triples :)
  return
    for $cr-node in $cr-nodes
    
    let $content := $cr-node
    
    let $concept-id-1 := fn:string($content/*:concept_id_1)
    let $concept-id-2 := fn:string($content/*:concept_id_2)
    
    return
      if ($concept-id-1 ne $concept-id-2) then
        
        let $rel-id := fn:string($content/*:relationship_id)
        let $rel-predicate := vfu:get-rel-predicate-form($rel-id, $map-rel-id-to-nodes)
        
        let $concept-1-final-uri := vfu:get-concept-final-uri($concept-id-1, $provider, $dataset, $is-version-agnostic)
        let $concept-2-final-uri := vfu:get-concept-final-uri($concept-id-2, $provider, $dataset, $is-version-agnostic)
        
        return
          (
          sem:triple(
          <sem:triple
            xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{$concept-1-final-uri}</sem:subject>
            <sem:predicate>{$rel-predicate}</sem:predicate>
            <sem:object>{$concept-2-final-uri}</sem:object>
          </sem:triple>),
          sem:triple(
          <sem:triple
            xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{$concept-1-final-uri}</sem:subject>
            <sem:predicate>{$skos-related}</sem:predicate>
            <sem:object>{$concept-2-final-uri}</sem:object>
          </sem:triple>),
          sem:triple(
          <sem:triple
            xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{$concept-2-final-uri}</sem:subject>
            <sem:predicate>{$skos-related}</sem:predicate>
            <sem:object>{$concept-1-final-uri}</sem:object>
          </sem:triple>),
          if (fn:contains($rel-predicate, "Mapped_from")) then
            sem:triple(
            <sem:triple
              xmlns:sem="http://marklogic.com/semantics">
              <sem:subject>{$concept-1-final-uri}</sem:subject>
              <sem:predicate>{fn:concat($vfu:vocab-rel, "mappedFrom")}</sem:predicate>
              <sem:object>{$concept-2-final-uri}</sem:object>
            </sem:triple>)
          else
            if (fn:contains($rel-predicate, "Mapped_to")) then
              sem:triple(
              <sem:triple
                xmlns:sem="http://marklogic.com/semantics">
                <sem:subject>{$concept-1-final-uri}</sem:subject>
                <sem:predicate>{fn:concat($vfu:vocab-rel, "mappedTo")}</sem:predicate>
                <sem:object>{$concept-2-final-uri}</sem:object>
              </sem:triple>)
            else
              ()
          )
      else
        ()
};

declare function vfu:get-concept-hier-triples(
$concept-id as xs:unsignedLong*, 
$concept-content-body as node()*,
$concept-anc-nodes as node()*,
$final-uri as xs:string,
$provider as xs:string,
$dataset as xs:string,
$is-version-agnostic as xs:boolean) as sem:triple* {
  
  let $skos-narrower := vfu:get-iri-for-common-prefix("skos", "narrower", fn:true())
  let $skos-broader := vfu:get-iri-for-common-prefix("skos", "broader", fn:true())
  
  for $concept-anc-node in $concept-anc-nodes
  
  let $concept-id-ancestor := fn:string($concept-anc-node/*:ancestor_concept_id)
  let $concept-id-descendant := fn:string($concept-anc-node/*:descendant_concept_id)
  
  return
    if ($concept-id-ancestor ne $concept-id-descendant) then
      
      let $concept-ancestor-final-uri := vfu:get-concept-final-uri($concept-id-ancestor, $provider, $dataset, $is-version-agnostic)
      let $concept-descendant-final-uri := vfu:get-concept-final-uri($concept-id-descendant, $provider, $dataset, $is-version-agnostic)
      
      let $concept-anc-to-desc-min-levels-of-sep := fn:floor(fn:number(fn:string($concept-anc-node/*:min_levels_of_separation)))
      let $concept-anc-to-desc-max-levels-of-sep := fn:floor(fn:number(fn:string($concept-anc-node/*:max_levels_of_separation)))
      
      return
        (
        sem:triple(
        <sem:triple
          xmlns:sem="http://marklogic.com/semantics">
          <sem:subject>{$concept-ancestor-final-uri}</sem:subject>
          <sem:predicate>{$skos-narrower}</sem:predicate>
          <sem:object>{$concept-descendant-final-uri}</sem:object>
        </sem:triple>),
        sem:triple(
        <sem:triple
          xmlns:sem="http://marklogic.com/semantics">
          <sem:subject>{$concept-descendant-final-uri}</sem:subject>
          <sem:predicate>{$skos-broader}</sem:predicate>
          <sem:object>{$concept-ancestor-final-uri}</sem:object>
        </sem:triple>),
        sem:triple(
        <sem:triple
          xmlns:sem="http://marklogic.com/semantics">
          <sem:subject>{$concept-ancestor-final-uri}</sem:subject>
          <sem:predicate>{fn:concat($vfu:vocab-rel, "minLevelsOfSep", "_", $concept-anc-to-desc-min-levels-of-sep)}</sem:predicate>
          <sem:object>{$concept-descendant-final-uri}</sem:object>
        </sem:triple>),
        sem:triple(
        <sem:triple
          xmlns:sem="http://marklogic.com/semantics">
          <sem:subject>{$concept-ancestor-final-uri}</sem:subject>
          <sem:predicate>{fn:concat($vfu:vocab-rel, "maxLevelsOfSep", "_", $concept-anc-to-desc-max-levels-of-sep)}</sem:predicate>
          <sem:object>{$concept-descendant-final-uri}</sem:object>
        </sem:triple>)
        )
    else
      ()


};
        
declare function vfu:get-concept-prov-triples(
$concept-id as xs:unsignedLong*, 
$concept-content-body as node()*,
$options as map:map,
$id as xs:string,
$final-uri as xs:string, 
$provider as xs:string,
$dataset as xs:string,
$is-version-agnostic as xs:boolean) as sem:triple* {
  
  let $gen-dts := 
    let $map-gen-dts := 
      if (map:contains($options, "gen-dts")) then
        map:get($options, "gen-dts")
      else
        map:map()
      
    return 
      if (map:contains($map-gen-dts, $id)) then 
        map:get($map-gen-dts, $id)
      else
        fn:current-dateTime()      

  let $flow-name := 
    if (map:contains($options, "flow")) then
      map:get($options, "flow")
    else
      "harmonize-concepts"
      
  return (
    sem:triple(
      <sem:triple
      xmlns:sem="http://marklogic.com/semantics">
      <sem:subject>{$final-uri}</sem:subject>
      <sem:predicate>{fn:concat($vfu:prov, "generatedAtTime")}</sem:predicate>                                                                     
      <sem:object datatype="http://www.w3.org/2001/XMLSchema#dateTime">{fn:format-dateTime($gen-dts, "[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z")}</sem:object>
    </sem:triple>),
    sem:triple(<sem:triple
      xmlns:sem="http://marklogic.com/semantics">
      <sem:subject>{$final-uri}</sem:subject>
      <sem:predicate>{fn:concat($vfu:prov, "wasGeneratedBy")}</sem:predicate>
      <sem:object datatype="http://www.w3.org/2001/XMLSchema#string" xml:lang="en">{"dhf-flow-" || $flow-name}</sem:object>
    </sem:triple>),
    sem:triple(<sem:triple
      xmlns:sem="http://marklogic.com/semantics">
      <sem:subject>{$final-uri}</sem:subject>
      <sem:predicate>{fn:concat($vfu:prov, "hadPrimarySource")}</sem:predicate>
      <sem:object>{"http://athena.ohdsi.org/vocabulary/" || $dataset}</sem:object>
    </sem:triple>)
  )
  
};
