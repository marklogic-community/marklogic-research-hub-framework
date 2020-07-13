(:
   Search endpoint to find Entities based on query parameters and facet selections.

:)

xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace resource = "http://marklogic.com/rest-api/resource/search";
import module namespace search = "http://marklogic.com/pharmahub/search-model" at
"/lib/searchModel.xqy";

(: TODO - clean up the entity specific code
 - this is a clone of search:search. rename it to make it clear what's happening
 - this exists to insert a boost query into the search structure
:)
declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
    let $start := (map:get($params,"start"),1)[1] cast as xs:unsignedLong
    let $pageLength := (map:get($params,"pageLength"),10)[1] cast as xs:unsignedLong
    let $options := map:get($params,"options")
    let $workspace-id := map:get($params,"workspaceId")
    let $workspace-relevance-query := map:get($params, "workspaceRelevanceQuery")
    return

    (: NOTE!! search:search below is a custom wrapper library, not the usual MarkLogic native search:search() :)
    document { 
       search:search($input,$options,$start,$pageLength,
        map:new((
            map:entry("format","json"),
            map:entry("workspaceId",$workspace-id),
            map:entry("workspaceRelevanceQuery", xs:boolean($workspace-relevance-query))
        )))
    }
};

