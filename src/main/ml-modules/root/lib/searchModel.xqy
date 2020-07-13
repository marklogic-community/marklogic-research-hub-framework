(: A replacement for MarkLogic native search.search that will find the current workspace and use it to build and add
   a relevance-adjusting cts.boostQuery to the search.

   The boostQuery() methods on the various Entity classes are used to build individual, per-entity boostQuery objects,
   with appropriate weights. The weights will be higher for "definite" items, lower for "likely" and negative for "not" 
   inclusions in the workspace.
 :)
module namespace sm= "http://marklogic.com/pharmahub/search-model";
declare namespace qm = "http://marklogic.com/xdmp/query-meters";

import module namespace search = "http://marklogic.com/appservices/search"
     at "/MarkLogic/appservices/search/search.xqy";

import module namespace sut = "http://marklogic.com/rest-api/lib/search-util"
    at "/MarkLogic/rest-api/lib/search-util.xqy";

import module namespace ast = "http://marklogic.com/appservices/search-ast"
    at "/MarkLogic/appservices/search/ast.xqy";
declare namespace mle = "http://marklogic.com/phr/lib/enrichment";

(: TODO - clean up the entity specific code
 - this is a clone of search:search. rename it to make it clear what's happening
 - this exists to insert a boost query into the search structure
:)
declare function sm:search($input as document-node(),
	$options-name as xs:string,
	$start as xs:unsignedLong,
	$page-length as xs:unsignedLong,
	$params as map:map) {
	 let $options := sm:get-options($options-name)
	 let $cts-query := sm:wrap-query(sm:to-cts(sm:parse-structured-query($input),$options),$params)
	 let $results := search:resolve($cts-query,$options,$start,$page-length)
	 let $results :=
	 	element search:response {
			$results/@*,
			$results/*[fn:not(self::search:result)],
			for $r in $results/search:result
			return
			  element search:result {
				  $r/@*,
				  (: this forces the transform output to be json. our transform output is such
				   : that it is always json. w/o this the "content" will be rendered as as string
				   : if the document is xml
				   :)
				  attribute format { "json" },
				  $r/node()
			  }
		}
	 let $meters := if (xdmp:log-level() eq "debug") then
	 					xdmp:query-meters()
	 				else ()
	 let $log-payload := sm:log-payload($meters, $params, $cts-query, $results)
	 return
		if(map:get($params,"format") eq "xml")
		then $results
		else sm:as-json($results)
};

declare function sm:wrap-query($input-query as cts:query,$params as map:map) as cts:query {
	let $workspace-id := map:get($params,"workspaceId")
	let $workspace-relevance-query := map:get($params, "workspaceRelevanceQuery")
	return
	if(fn:empty($workspace-id) or not($workspace-relevance-query))
	then $input-query
	else
		let $query := cts:and-query((
	    cts:collection-query("workspace"),
	     cts:json-property-value-query("id",$workspace-id,"exact")
	     	))
		return
			cts:boost-query(
				$input-query,
				cts:or-query((
					for $entity in cts:search(/,$query)/envelope/instance/workspace/entities/*
					let $strength-level := $entity/predicates/*/fn:string()
					let $weight :=
						switch($strength-level)
						case "Definite" return 5
						case "likely" return 2
						case "not" return -1
						default return 0
					return
						xdmp:javascript-eval('var entity; var weight; require("/entities/allEntities.sjs").getBoostQuery(entity, weight)', ("entity", $entity, "weight", $weight))
				))
			)
};
declare function sm:parse-structured-query($input as document-node()) as element(search:query) {
	sut:search-from-json(
	            $input
	        )/search:query
};
declare function sm:as-json($result as element(search:response)) as item()* {
	sut:response-to-json-object($result, ("results"))
};

declare function sm:to-cts($sq as element(search:query), $options as element(search:options)) as cts:query?
{
  map:get(ast:to-query($sq, $options), "query")
};

declare function sm:get-options($optionName as xs:string) as element(search:options)* {
	sut:options(map:entry("options", $optionName))
};

declare function sm:log-payload($meters as element(),
					$params as map:map, $query as cts:query,
					$results as element(search:response)) {
	let $queryJson :=
		json:object()
	  		=>map:with('ctsQuery', $query)

	let $inputCombined := json:object()
				=>map:with("parameters", $params)
				=>map:with("query", $queryJson)
	let $outputCombined :=
		json:object()
				=>map:with("metrics", sm:get-metrics($results))
				=>map:with("uris", sm:get-result-uris($results))
				=>map:with("meterStats", sm:get-meter-stats($meters))
	let $payloadCombined := json:object()
			=>map:with("input", $inputCombined)
			=>map:with("output", $outputCombined)
	let $_ := xdmp:log($payloadCombined, "debug")
	return ()
};

declare function sm:get-metrics($results as element(search:response)) as map:map {
	let $metricsJson:= json:object()
			=>map:with("query-resolution-time", $results/search:metrics/search:query-resolution-time/text())
			=>map:with("facet-resolution-time", $results/search:metrics/search:facet-resolution-time/text())
			=>map:with("snippet-resolution-time", $results/search:metrics/search:snippet-resolution-time/text())
			=>map:with("extract-resolution-time", $results/search:metrics/search:extract-resolution-time/text())
			=>map:with("total-time", $results/search:metrics/search:total-time/text())
	return $metricsJson
};

declare function sm:get-result-uris($results as element(search:response)) as json:object {
	let $json-result := json:object()
	let $uris :=
		for $result in $results
		return
		fn:string-join($result/search:result/@uri/fn:string(), ",")
	let $_ := map:put($json-result, "Result URIS", $uris)
	return $json-result
};

declare function sm:get-meter-stats($meters as element()) {
	let $metersJson :=
		if ($meters) then
			json:object()
		  		=>map:with('expanded-tree-cache-hits', $meters/qm:expanded-tree-cache-hits/fn:string())
		  		=>map:with('expanded-tree-cache-misses', $meters/qm:expanded-tree-cache-misses/fn:string())
		  		=>map:with('list-cache-hits', $meters/qm:list-cache-hits/fn:string())
		  		=>map:with('list-cache-misses', $meters/qm:list-cache-misses/fn:string())
		  		=>map:with('triple-cache-hits', $meters/qm:triple-cache-hits/fn:string())
		  		=>map:with('triple-cache-misses', $meters/qm:triple-cache-misses/fn:string())
		  		=>map:with('lock-time', $meters/qm:lock-time/fn:string())
		else json:object()
	return $metersJson
};
