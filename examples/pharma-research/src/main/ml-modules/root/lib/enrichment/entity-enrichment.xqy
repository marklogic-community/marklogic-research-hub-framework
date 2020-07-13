xquery version "1.0-ml";

module namespace ee = "http://marklogic.com/phr/lib/enrichment/entity-enrichment";

declare namespace mle = "http://marklogic.com/phr/lib/enrichment";

declare function ee:validateOptions($options as map:map){
    let $threshold as xs:double := xs:double( (map:get($options, "threshold"), 0.0)[1]  )
    let $showRelevance as xs:boolean := map:get($options, "showRelevance") = fn:true()
    let $limitPerEntity as xs:int := xs:int( (map:get($options, "limitPerEntity"), 25)[1])

    let $_:= (
        map:put($options, "threshold", $threshold),
        map:put($options, "showRelevance", $showRelevance),
        map:put($options, "limitPerEntity", $limitPerEntity)
        )
    return $options
};

declare function ee:enrich( $uri as xs:string, $options as map:map ) {
    let $options := ee:validateOptions($options)
    let $doc := <x>{fn:doc($uri)/element()}</x>
    let $entities := ee:matchedEntities($uri, $doc, $options)
    return (
        <mle:enrichment>
            <mle:meta>
                {$entities}
            </mle:meta>
        </mle:enrichment>
    )
};

declare function ee:matchedEntities($uri as xs:string, $doc, $options) as element() {
    <mle:entities>
    {
        ee:matchedEntitiesbyType($uri, $doc, $options)
    }
    </mle:entities>
};

declare function ee:matchedEntitiesbyType($uri, $doc, $options) {
    let $collectionTypes := xdmp:javascript-eval('Sequence.from(require("/entities/allEntities.sjs").enrichableCollections())')
    let $_ := xdmp:log(("$collectionTypes", $collectionTypes))
    let $elements :=
    (
        let $search :=
        xdmp:invoke-function(
          function() {
            cts:search(fn:doc(),
                cts:and-query((
                    cts:reverse-query( $doc ),
                    cts:collection-query($collectionTypes)
                    ))
                )
          },
          <options xmlns="xdmp:eval">
            <update>false</update>
            <commit>explicit</commit>
            <database>{map:get($options, "targetDb")}</database>
          </options>
        )
        let $enrichmentObjectNodes := $search/envelope/instance/object-node()/enrichment
        let $threshold :=  map:get($options,"threshold")
        let $showRelevance := map:get($options,"showRelevance")
        let $limitPerEntity := map:get($options,"limitPerEntity")
        for $enrichmentObjectNode in $enrichmentObjectNodes
        let $enrichmentObjectUri as xs:string* := xdmp:node-uri($enrichmentObjectNode)
        let $type := ee:getType($collectionTypes, $enrichmentObjectUri)
        let $preferredName as xs:string* := $enrichmentObjectNode/preferredName
        let $conceptTerms as xs:string* := $enrichmentObjectNode/query//text
        let $result :=
          (cts:search(
            fn:doc(),
            cts:and-query((
              cts:word-query($conceptTerms),
              cts:document-query($uri)
            )),
            (
                if($showRelevance) then ("relevance-trace") else (),
                "unfiltered", "score-logtfidf"
            )
          ))[1]
        let $relevanceInfo := if ($showRelevance) then (cts:relevance-info($result)) else ()
        let $confidence := cts:confidence($result)
        where $confidence ge $threshold
        order by $confidence descending
        return
            (element {xs:QName("mle:" || $type)} {
                attribute preferredName { $preferredName},
                attribute uri { $enrichmentObjectUri},
                attribute confidence {$confidence},
                $relevanceInfo

            })[1 to $limitPerEntity]
    )
    for $c in $collectionTypes
    return
        element {xs:QName("mle:" || $c || "s")} {
          for $element in $elements
          where fn:contains(fn:lower-case($element/@uri),"/" || fn:lower-case($c) || "/")
          return $element
        }
};

(:
 : Examine the enrichemnt object URI to see if it has an enrichable type
 : and then define the type based on that. Note, URI for protein begins with /Protein
 :
 : @param $enrichmentObjectUri Document URI matched by reverse query
 : @return $type - whether it is an enrichable type
 :)
declare function ee:getType($collectionTypes, $enrichmentObjectUri) {
  let $deriveType := fn:tokenize($enrichmentObjectUri, "/")[2]
  let $type := fn:head($collectionTypes[fn:lower-case($deriveType) eq fn:lower-case(.)])
  return
    ($type, "unknown")[1]
};
